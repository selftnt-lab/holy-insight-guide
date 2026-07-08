import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface KbDoc {
  id: string;
  title: string;
  source: string | null;
  created_at: string;
  content: string;
}

const AdminKnowledge = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kb_documents")
      .select("id, title, source, created_at, content")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setDocs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const handleFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".txt")) {
      toast.error("Envie um arquivo .txt");
      return;
    }
    const text = await f.text();
    setContent(text);
    if (!title) setTitle(f.name.replace(/\.txt$/i, ""));
  };

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("kb-ingest", {
        body: { title: title.trim(), source: source.trim() || null, content },
      });
      if (error) throw error;
      toast.success(`Documento indexado (${data?.chunks ?? 0} trechos)`);
      setTitle("");
      setSource("");
      setContent("");
      if (fileRef.current) fileRef.current.value = "";
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao indexar");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este documento e seus trechos indexados?")) return;
    const { error } = await supabase.from("kb_documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  if (roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-[108px]">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-[130px] pb-24 text-center">
        <h1 className="mb-2 font-serif text-2xl">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground">
          Esta área é reservada a administradores da base de conhecimento.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-[124px] pb-28">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="mb-1 font-serif text-3xl">Base de conhecimento</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Materiais em texto usados para ancorar as respostas do Tutor IA.
      </p>

      <Card className="mb-8 p-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Arquivo .txt
          </label>
          <Input
            ref={fileRef}
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Título
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Confissão de Fé — Cap. 1"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Fonte / referência (opcional)
          </label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Autor, livro, URL..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Conteúdo
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Cole o texto ou envie um .txt acima"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {content.length.toLocaleString()} caracteres
          </p>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={16} /> Indexando...
            </>
          ) : (
            <>
              <Upload className="mr-2" size={16} /> Adicionar à base
            </>
          )}
        </Button>
      </Card>

      <h2 className="mb-3 font-serif text-xl">Documentos ({docs.length})</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : docs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum documento cadastrado ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <Card key={d.id} className="flex items-start gap-3 p-3">
              <FileText size={18} className="mt-0.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.title}</p>
                {d.source && (
                  <p className="truncate text-xs text-muted-foreground">
                    {d.source}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString("pt-BR")} ·{" "}
                  {d.content.length.toLocaleString()} caracteres
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(d.id)}
                className="text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminKnowledge;
