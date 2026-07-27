import PageSeo from "@/components/PageSeo";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(1, "Nome obrigatório").max(60);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, needsConfirmation, signOut, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showResendCooldown, setShowResendCooldown] = useState(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupPendingEmail, setSignupPendingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const rawNext = searchParams.get("next");
  const safeNext =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/";

  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showResendCooldown > 0) {
      interval = setInterval(() => {
        setShowResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showResendCooldown]);

  useEffect(() => {
    if (!authLoading && user && !needsConfirmation) {
      const isConfirming = sessionStorage.getItem("confirming_signup");
      if (isConfirming) return;
      
      navigate(safeNext, { replace: true });
    }
  }, [user, authLoading, needsConfirmation, navigate, safeNext]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    
    if (error) {
      console.error("Login error:", error);
      
      if (error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("verifique seu e-mail")) {
        // Como o backend foi reconfigurado para auto-confirmar, este erro não deve mais ocorrer.
        // Mas se ocorrer por algum cache, tentamos forçar o login uma última vez.
        const { error: secondTry } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (!secondTry) return;
      }
      
      let errorMessage = error.message;
      
      if (error.message.includes("Invalid login credentials") || error.message.includes("Email ou senha incorretos")) {
        errorMessage = "Email ou senha incorretos. Por favor, verifique seus dados ou use a recuperação de senha.";
      }

      toast.error(errorMessage, {
        duration: 6000,
        action: {
          label: "Recuperar Senha",
          onClick: () => setIsForgotPassword(true)
        }
      });
      return;
    }
    
    toast.success("Bem-vindo de volta!");
    
    // Forçar atualização do estado local do Supabase
    await supabase.auth.refreshSession();
    
    setTimeout(() => {
      // Usamos replace: true para limpar o histórico e evitar que o 'back' volte para a tela de login
      navigate(safeNext, { replace: true });
      // Forçamos o redirecionamento via location para garantir que o Router limpe estados internos
      window.location.assign(safeNext);
    }, 150);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(signupName);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { display_name: signupName },
        },
      });

      setLoading(false);

      if (error) {
        console.error("Auth Signup Error:", error);
        if (error.message.includes("already registered")) {
          toast.error("Este e-mail já está em uso. Tente fazer login.", {
            duration: Infinity,
            action: {
              label: "Ir para Login",
              onClick: () => {
                setLoginEmail(signupEmail);
                setActiveTab("login");
              }
            }
          });
          return;
        }
        
        let message = error.message;
        if (message.includes("weak_password")) message = "A senha é muito fraca. Use uma combinação de letras, números e símbolos.";
        toast.error(message, { duration: 5000 });
        return;
      }
      
      // Cadastro bem-sucedido, redireciona imediatamente se o auto-confirm estiver on
      toast.success("Conta criada com sucesso! Entrando...");
      // Forçamos o refresh do banco após o signup para garantir que o trigger handle_new_user completou
      await new Promise(resolve => setTimeout(resolve, 500));
      await supabase.auth.refreshSession();
      
      setTimeout(() => {
        window.location.href = safeNext;
      }, 500);
    } catch (err) {
      console.error("Signup exception:", err);
      toast.error("Ocorreu um erro inesperado ao criar conta.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(forgotPasswordEmail);
    } catch (err) {
      toast.error("E-mail inválido");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setResetEmailSent(true);
      toast.success("Link de recuperação enviado!");
    }
  };

  const handleResendConfirmation = async () => {
    if (showResendCooldown > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("E-mail de confirmação reenviado!");
      setShowResendCooldown(60);
    }
  };

  if (signupPendingEmail || (needsConfirmation && user)) {
    // Redireciona imediatamente se já tiver usuário, ignorando confirmação pendente
    if (user) {
      navigate(safeNext, { replace: true });
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-serif font-bold">Acessando...</h2>
          <Button onClick={() => navigate(safeNext, { replace: true })}>Clique aqui se não for redirecionado</Button>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <PageSeo title="Recuperar Senha — RC Bible" description="Recupere o acesso à sua conta RC Bible." path="/auth" />
        <Card className="w-full max-w-md p-6 rounded-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold">Recuperar Senha</h2>
            <p className="text-sm text-muted-foreground">
              {resetEmailSent 
                ? "Se este e-mail estiver cadastrado, você receberá um link em instantes."
                : "Digite seu e-mail para receber as instruções de recuperação."}
            </p>
          </div>
          
          {!resetEmailSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">E-mail</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsForgotPassword(false)}>
              Voltar para o Login
            </Button>
          )}
          
          {!resetEmailSent && (
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-center text-sm text-muted-foreground hover:underline"
            >
              Lembrei minha senha
            </button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <PageSeo title="Entrar — RC Bible" description="Faça login ou crie sua conta gratuita na RC Bible: leitura bíblica, estudo com IA, planos e devocional diário." path="/auth" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size="xl" />
          <p className="mt-4 text-lg text-muted-foreground">Renovada Church</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" id="login-tab">Entrar</TabsTrigger>
              <TabsTrigger value="signup" id="signup-tab">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="auth-login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    data-testid="auth-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  data-testid="auth-login-submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome</Label>
                  <Input
                    id="signup-name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="signup-password">Senha</Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded italic">
                      Mín. 6 chars, letras e números recomendados
                    </span>
                  </div>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Sua senha segura"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight px-1">
                    A senha deve ser protegida. Se for muito simples (ex: 123456), o sistema recusará por segurança.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
