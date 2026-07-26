import React from "react";
import PageSeo from "@/components/PageSeo";
import { Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Contribute = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const pixKey = "renovadachurchsinop@gmail.com";
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageSeo 
        title="Contribuir — RC Bible" 
        description="Apoie a Renovada Church e o desenvolvimento do RC Bible." 
        path="/contribute" 
      />

      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <Heart className="text-accent w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Formas de Contribuir</h1>
        <p className="text-muted-foreground">Sua oferta apoia o Reino e este ministério digital.</p>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif text-accent flex items-center gap-2">
              Dízimos e Ofertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chave Pix (E-mail)</label>
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
                <code className="text-sm flex-1 break-all">{pixKey}</code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(pixKey, 'pix')}
                  className={copied === 'pix' ? 'text-green-500' : ''}
                >
                  {copied === 'pix' ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transferência Bancária</label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Banco</p>
                  <p className="font-medium">Sicredi – 748</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Agência</p>
                  <p className="font-medium">0812</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conta Corrente</p>
                  <p className="font-medium">42827-5</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CNPJ</p>
                  <p className="font-medium">01.296.276/0001-21</p>
                </div>
              </div>
              <p className="text-sm font-medium pt-1">Igreja Presbiteriana Renovada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Outras Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              Em breve, novas campanhas para ações sociais e desenvolvimento da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-20" /> {/* Spacer for BottomNav */}
    </div>
  );
};

export default Contribute;