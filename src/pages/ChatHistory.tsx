import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, MessageSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AiChat, { ChatContext, TopicContext } from "@/components/AiChat";

interface HistoryRow {
  id: string;
  title: string;
  context: (Partial<ChatContext> & Partial<TopicContext>) | null;
  messages: { role: "user" | "assistant"; content: string }[];
  created_at: string;
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<HistoryRow | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_history")
      .select("id, title, context, messages, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar histórico");
    setItems((data ?? []) as unknown as HistoryRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const removeOne = async (id: string) => {
    const { error } = await supabase.from("chat_history").delete().eq("id", id);
    if (error) return toast.error("Não foi possível excluir");
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Conversa removida");
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("chat_history").delete().eq("user_id", user.id);
    if (error) return toast.error("Não foi possível limpar");
    setItems([]);
    toast.success("Histórico apagado");
  };

  const firstUserQuestion = (msgs: HistoryRow["messages"]) =>
    msgs.find((m) => m.role === "user")?.content ?? "";

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-base font-semibold text-foreground">Histórico do Tutor IA</h1>
          {items.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Limpar tudo">
                  <Trash2 size={18} className="text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar todo o histórico?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Suas {items.length} conversas serão removidas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAll}>Apagar tudo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div className="w-10" />
          )}
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          Guardamos suas <strong>10 últimas conversas</strong> com o Tutor IA. Conversas mais antigas são removidas
          automaticamente.
        </p>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Carregando…</p>
        ) : items.length === 0 ? (
          <Card className="rounded-xl p-8 text-center">
            <Sparkles size={28} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">Nenhuma conversa ainda</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Abra o Tutor IA durante a leitura para começar.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <button
                      className="flex-1 text-left"
                      onClick={() => setViewing(item)}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-accent shrink-0" />
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {firstUserQuestion(item.messages) || "—"}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("pt-BR")}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOne(item.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 size={16} className="text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewing && (
          <AiChat
            onClose={() => setViewing(null)}
            readOnly
            initialMessages={viewing.messages}
            context={
              viewing.context && "bookName" in viewing.context && viewing.context.bookName
                ? (viewing.context as ChatContext)
                : undefined
            }
            topic={
              viewing.context && "topicName" in viewing.context && viewing.context.topicName
                ? (viewing.context as TopicContext)
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatHistory;
