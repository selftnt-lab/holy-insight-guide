import PageSeo from "@/components/PageSeo";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import rcBibleLogo from "@/assets/rc-bible-logo-new.png.asset.json";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
        setPendingEmail(loginEmail);
        setSignupPendingEmail(true);
        toast.error("E-mail não confirmado. Verifique sua caixa de entrada.");
        return;
      }
      
      toast.error(
        error.message.includes("Invalid login")
          ? "Email ou senha incorretos"
          : error.message
      );
      return;
    }
    
    toast.success("Bem-vindo de volta!");
    setTimeout(() => {
      navigate(safeNext, { replace: true });
    }, 100);
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
      
      setPendingEmail(signupEmail);
      setSignupPendingEmail(true);
      toast.success("Verifique seu e-mail para ativar sua conta.");
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
    const displayEmail = pendingEmail || user?.email;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-6 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-primary/10 rounded-full w-fit mx-auto"
          >
            <div className="h-12 w-12 text-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-foreground">Confirme seu e-mail</h2>
            <p className="text-muted-foreground">
              Enviamos um link de ativação para <strong>{displayEmail}</strong>.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg text-sm text-amber-800 dark:text-amber-200 mt-4 text-left">
              <p className="font-semibold mb-1">Não recebeu o e-mail?</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Verifique sua pasta de <strong>Spam</strong> ou Lixo Eletrônico.</li>
                <li>Certifique-se de que o e-mail acima está correto.</li>
                <li>Aguarde alguns minutos; o envio pode levar um tempo.</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full rounded-xl"
              onClick={handleResendConfirmation}
              disabled={loading || showResendCooldown > 0}
            >
              {showResendCooldown > 0 ? `Aguarde ${showResendCooldown}s` : "Reenviar e-mail de confirmação"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-xl"
              onClick={() => {
                signOut();
                setSignupPendingEmail(false);
              }}
            >
              Voltar para o Login
            </Button>
          </div>
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
          <img
            src={rcBibleLogo.url}
            alt="RC Bible - Renovada Church"
            className="h-56 w-auto object-scale-down drop-shadow-2xl transition-all duration-500 hover:scale-105 dark:brightness-110 dark:contrast-125"
          />
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Guia Bíblico</h1>
          <p className="text-sm text-muted-foreground">Seu tutor para estudar a Bíblia</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              if (safeNext !== "/") {
                try {
                  sessionStorage.setItem("post_auth_next", safeNext);
                } catch { /* ignore */ }
              }
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: `${window.location.origin}/auth/callback`,
              });
              if (result.error) {
                setLoading(false);
                toast.error("Não foi possível entrar com Google");
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continuar com Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl mt-3"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              if (safeNext !== "/") {
                try {
                  sessionStorage.setItem("post_auth_next", safeNext);
                } catch { /* ignore */ }
              }
              const result = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: `${window.location.origin}/auth/callback`,
              });
              if (result.error) {
                setLoading(false);
                toast.error("Não foi possível entrar com Apple");
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continuar com Apple
          </Button>



          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" id="login-tab">Entrar</TabsTrigger>
              <TabsTrigger value="signup" id="signup-tab">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
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
              <form onSubmit={handleSignup} className="space-y-4">
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
