import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import rcBibleLogo from "@/assets/app-logo.svg.asset.json";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string; logo_uri?: string };
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// Minimal typed wrapper — supabase.auth.oauth is beta and not yet in the
// generated types. We keep it local so we only rely on the SDK methods, not
// raw HTTP endpoints.
type OAuthNS = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function getOAuthNS(): OAuthNS | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ns = (supabase.auth as any)?.oauth;
  return ns ?? null;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Requisição inválida: authorization_id ausente.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/auth?next=${encodeURIComponent(next)}`;
        return;
      }
      setUserEmail(sess.session.user.email ?? null);

      const ns = getOAuthNS();
      if (!ns) {
        setError(
          "O servidor de OAuth ainda não está ativo neste projeto. Contate o administrador.",
        );
        return;
      }
      const { data, error: err } = await ns.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const ns = getOAuthNS();
    if (!ns) {
      setBusy(false);
      setError("Servidor OAuth indisponível.");
      return;
    }
    const { data, error: err } = approve
      ? await ns.approveAuthorization(authorizationId)
      : await ns.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou uma URL de redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "Aplicativo externo";

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={rcBibleLogo.url}
            alt="RC Bible"
            className="h-24 w-auto object-scale-down transition-all duration-700 dark:brightness-[1.15] dark:contrast-[1.1] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            style={{ 
              transitionProperty: "filter, transform, opacity, brightness, contrast",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>

        <Card className="p-6 rounded-2xl space-y-5">
          {error ? (
            <>
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Não foi possível carregar o pedido de autorização
              </h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </>
          ) : !details ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  Conectar {clientName} à sua conta
                </h1>
                <p className="text-sm text-muted-foreground">
                  {clientName} poderá usar as ferramentas habilitadas do RC Bible
                  como você enquanto estiver conectado.
                </p>
              </div>

              {userEmail && (
                <p className="text-xs text-muted-foreground">
                  Conectado como <span className="font-medium">{userEmail}</span>
                </p>
              )}

              <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p>• Compartilhar seu perfil e e-mail básicos.</p>
                <p>
                  • Ler e criar seus documentos do Escritor, destaques de
                  versículos e buscas na sua biblioteca pessoal.
                </p>
                <p>
                  Isto não substitui as permissões do app: o RLS continua
                  garantindo que apenas os seus dados fiquem acessíveis.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full rounded-xl"
                  disabled={busy}
                  onClick={() => decide(true)}
                >
                  {busy ? "…" : "Aprovar"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
