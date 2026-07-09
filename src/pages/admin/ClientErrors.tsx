import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ErrorRow {
  id: string;
  user_id: string | null;
  created_at: string;
  route: string | null;
  message: string;
  stack: string | null;
  user_agent: string | null;
  build: string | null;
}

const PAGE_SIZE = 50;

const ClientErrors = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ErrorRow | null>(null);
  const [filterRoute, setFilterRoute] = useState("");
  const [filterText, setFilterText] = useState("");
  const [purging, setPurging] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_error_logs")
      .select("id, user_id, created_at, route, message, stack, user_agent, build")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (error) toast.error("Falha ao carregar logs");
    setRows((data as ErrorRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterRoute && !(r.route ?? "").toLowerCase().includes(filterRoute.toLowerCase())) return false;
      if (filterText && !r.message.toLowerCase().includes(filterText.toLowerCase())) return false;
      return true;
    });
  }, [rows, filterRoute, filterText]);

  const handlePurge = async () => {
    setPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke("purge-client-error-logs", {
        body: { days: 30 },
      });
      if (error) throw error;
      toast.success(`Removidos ${data?.deleted ?? 0} logs > 30 dias`);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao limpar logs");
    } finally {
      setPurging(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pb-32 pt-12">
        <div className="mx-auto max-w-lg px-5 text-center">
          <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
          <h1 className="text-xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva para administradores.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-3xl px-5 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Erros do cliente</h1>
              <p className="text-xs text-muted-foreground">
                Últimos {PAGE_SIZE} registros
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={purging}>
                  <Trash2 size={14} className="mr-1" /> Limpar antigos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar logs antigos</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove todos os registros com mais de 30 dias. Esta ação é
                    irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handlePurge();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {purging ? "Limpando..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Filtrar por rota..."
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
          />
          <Input
            placeholder="Filtrar por mensagem..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nenhum log encontrado.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <Card
                key={r.id}
                onClick={() => setSelected(r)}
                className="cursor-pointer rounded-xl p-3 transition hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{new Date(r.created_at).toLocaleString("pt-BR")}</span>
                      {r.route && (
                        <>
                          <span>·</span>
                          <span className="truncate">{r.route}</span>
                        </>
                      )}
                      {r.build && <Badge variant="secondary" className="ml-1">{r.build}</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Detalhes do erro</SheetTitle>
            <SheetDescription>
              {selected && new Date(selected.created_at).toLocaleString("pt-BR")}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Mensagem
                </p>
                <p className="whitespace-pre-wrap break-words">{selected.message}</p>
              </div>
              {selected.route && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Rota
                  </p>
                  <p className="break-all">{selected.route}</p>
                </div>
              )}
              {selected.build && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Build
                  </p>
                  <p>{selected.build}</p>
                </div>
              )}
              {selected.user_agent && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    User-Agent
                  </p>
                  <p className="break-all text-xs">{selected.user_agent}</p>
                </div>
              )}
              {selected.stack && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Stack
                  </p>
                  <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
                    {selected.stack}
                  </pre>
                </div>
              )}
              {selected.user_id && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    User ID
                  </p>
                  <p className="break-all font-mono text-xs">{selected.user_id}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientErrors;
