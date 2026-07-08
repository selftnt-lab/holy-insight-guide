import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload, FileText, ArrowLeft, Settings2, Save, FlaskConical, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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

  // RAG settings
  const [threshold, setThreshold] = useState(0.35);
  const [matchCount, setMatchCount] = useState(5);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

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

  const loadSettings = useCallback(async () => {
    const { data } = await supabase
      .from("kb_settings")
      .select("similarity_threshold, match_count")
      .eq("id", true)
      .maybeSingle();
    if (data) {
      setThreshold(data.similarity_threshold ?? 0.35);
      setMatchCount(data.match_count ?? 5);
    }
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      void load();
      void loadSettings();
    }
  }, [isAdmin, load, loadSettings]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from("kb_settings")
      .update({ similarity_threshold: threshold, match_count: matchCount })
      .eq("id", true);
    setSavingSettings(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
  };

  const handleFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".txt")) {
      toast.error("Envie um arquivo .txt");
      return;
    }
    const text = await f.text();
    setContent(text);
    if (!title) setTitle(f.name.replace(/\.txt$/i, ""));
  };

  const [jobProgress, setJobProgress] = useState<{
    processed: number;
    total: number;
    status: string;
  } | null>(null);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }
    setSubmitting(true);
    setJobProgress({ processed: 0, total: 0, status: "pending" });
    try {
      const { data, error } = await supabase.functions.invoke("kb-ingest", {
        body: { title: title.trim(), source: source.trim() || null, content },
      });
      if (error) throw error;
      const jobId: string | undefined = data?.job_id;
      if (!jobId) throw new Error("Job não criado");

      // Poll status
      await new Promise<void>((resolve, reject) => {
        const iv = setInterval(async () => {
          const { data: j } = await supabase
            .from("kb_ingest_jobs")
            .select("status, processed_chunks, total_chunks, error")
            .eq("id", jobId)
            .maybeSingle();
          if (!j) return;
          setJobProgress({
            processed: j.processed_chunks ?? 0,
            total: j.total_chunks ?? 0,
            status: j.status,
          });
          if (j.status === "completed") {
            clearInterval(iv);
            resolve();
          } else if (j.status === "failed") {
            clearInterval(iv);
            reject(new Error(j.error ?? "Falha no processamento"));
          }
        }, 1500);
      });

      toast.success("Documento indexado com sucesso");
      setTitle("");
      setSource("");
      setContent("");
      if (fileRef.current) fileRef.current.value = "";
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao indexar");
    } finally {
      setSubmitting(false);
      setJobProgress(null);
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

      <Card className="mb-8 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-accent" />
          <h2 className="font-serif text-lg">Ajustes do RAG</h2>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Limite de similaridade
            </label>
            <span className="font-mono text-xs">{threshold.toFixed(2)}</span>
          </div>
          <Slider
            value={[threshold]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => setThreshold(v[0])}
            disabled={!settingsLoaded}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Trechos abaixo deste valor são descartados. Mais alto = mais restrito.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Trechos por consulta (k)
            </label>
            <span className="font-mono text-xs">{matchCount}</span>
          </div>
          <Slider
            value={[matchCount]}
            min={1}
            max={20}
            step={1}
            onValueChange={(v) => setMatchCount(v[0])}
            disabled={!settingsLoaded}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Máximo de trechos recuperados por pergunta antes do filtro.
          </p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={savingSettings || !settingsLoaded}
          variant="secondary"
          className="w-full"
        >
          {savingSettings ? (
            <><Loader2 className="mr-2 animate-spin" size={16} /> Salvando...</>
          ) : (
            <><Save className="mr-2" size={16} /> Salvar configurações</>
          )}
        </Button>
      </Card>


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
              <Loader2 className="mr-2 animate-spin" size={16} />
              {jobProgress && jobProgress.total > 0
                ? `Indexando ${jobProgress.processed}/${jobProgress.total}...`
                : "Iniciando..."}
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
