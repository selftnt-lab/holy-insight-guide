import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, needsConfirmation, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto">
            <div className="h-12 w-12 text-accent flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-foreground">Confirme seu e-mail</h2>
            <p className="text-muted-foreground">
              Enviamos um link de confirmação para <strong>{user.email}</strong>. 
              Por favor, clique no link para ativar sua conta e acessar o aplicativo.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground italic">
              Não recebeu? Verifique sua caixa de spam ou lixo eletrônico.
            </p>
            <Button 
              variant="outline" 
              className="w-full rounded-xl"
              onClick={() => signOut()}
            >
              Voltar para o Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
