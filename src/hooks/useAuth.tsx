import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsConfirmation: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  needsConfirmation: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Verifica confirmação de email
        if (newSession?.user) {
          const isConfirmed = !!newSession.user.email_confirmed_at || 
                              newSession.user.app_metadata.provider !== 'email';
          
          // Se não estiver confirmado, forçamos o logout se necessário ou apenas marcamos o estado
          setNeedsConfirmation(!isConfirmed);
        } else {
          setNeedsConfirmation(false);
        }
        
        setLoading(false);
      }
    );

    // THEN get existing session (com fallback para sessão inválida)
    supabase.auth.getSession().then(async ({ data: { session: existing }, error }) => {
      if (error || (existing && !existing.user)) {
        const { clearAuthStorage } = await import("@/lib/clear-auth-storage");
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        clearAuthStorage();
        setSession(null);
        setUser(null);
      } else {
        setSession(existing);
        setUser(existing?.user ?? null);
        
        if (existing?.user) {
          const isConfirmed = existing.user.email_confirmed_at || 
                              existing.user.app_metadata.provider !== 'email';
          setNeedsConfirmation(!isConfirmed);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, needsConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
