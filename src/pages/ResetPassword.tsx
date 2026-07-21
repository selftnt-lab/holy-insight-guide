import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageSeo from "@/components/PageSeo";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <PageSeo title="Nova Senha — RC Bible" description="Defina sua nova senha de acesso." path="/reset-password" />
      <Card className="w-full max-w-md p-6 rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif font-bold">Definir Nova Senha</h2>
          <p className="text-sm text-muted-foreground">
            Escolha uma senha forte para sua segurança.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Atualizando..." : "Salvar Nova Senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;