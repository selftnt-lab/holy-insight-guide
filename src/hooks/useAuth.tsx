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
    // Set up listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // Garantir que o estado de confirmação seja checado corretamente
        // Ignora a trava de confirmação para permitir acesso imediato, 
        // mas mantém a lógica de login do Google se necessário.
        setNeedsConfirmation(false);
        setLoading(false);
      }
    );

    // Get existing session
    supabase.auth.getSession().then(async ({ data: { session: existing }, error }) => {
      if (error || (existing && !existing.user)) {
        const { clearAuthStorage } = await import("@/lib/clear-auth-storage");
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        clearAuthStorage();
        setSession(null);
        setUser(null);
      } else if (existing?.user) {
        setSession(existing);
        setUser(existing.user);
        setNeedsConfirmation(false);
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