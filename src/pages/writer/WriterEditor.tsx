import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useCreateDocument,
  useUpdateDocument,
  useUserDocument,
  DOC_TYPE_LABEL,
  UserDocType,
} from "@/hooks/useUserDocuments";
import SacredDivider from "@/components/SacredDivider";
import { renderChildrenWithBibleRefs } from "@/components/BibleReferenceLink";

const VALID_TYPES: UserDocType[] = ["sermon", "devotional", "study", "note"];

const WriterEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const typeParam = params.get("type") as UserDocType | null;
  const initialType: UserDocType =
    typeParam && VALID_TYPES.includes(typeParam) ? typeParam : "note";

  const { data: doc, isLoading, isError } = useUserDocument(isNew ? undefined : id);
  const createDoc = useCreateDocument();
  const updateDoc = useUpdateDocument();

  const [type, setType] = useState<UserDocType>(initialType);
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [contentMd, setContentMd] = useState("");

  useEffect(() => {
    if (doc) {
      setType(doc.type);
      setTitle(doc.title);
      setTagsInput(doc.tags.join(", "));
      setContentMd(doc.content_md);
    }
  }, [doc]);

  const parseTags = (s: string) =>
    s.split(",").map((t) => t.trim()).filter(Boolean);

  const handleSave = async () => {
    const tags = parseTags(tagsInput);
    if (isNew) {
      const created = await createDoc.mutateAsync({
        type,
        title,
        content_md: contentMd,
        tags,
      });
      navigate(`/writer/${created.id}`, { replace: true });
    } else if (id) {
      await updateDoc.mutateAsync({ id, title, content_md: contentMd, tags });
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isNew && (isError || doc === null)) {
    return (
      <div className="min-h-screen pb-32">
        <div className="mx-auto max-w-lg px-5 pt-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/writer")} className="-ml-2">
            <ChevronLeft size={16} className="mr-1" /> Voltar
          </Button>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Documento não encontrado ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const saving = createDoc.isPending || updateDoc.isPending;

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/writer")}
          className="-ml-2 text-muted-foreground"
        >
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </Button>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary">{DOC_TYPE_LABEL[type]}</Badge>
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold">
          {isNew ? "Novo documento" : "Editar documento"}
        </h1>
        <SacredDivider className="mt-4" />

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do documento"
              className="mt-1"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="mt-1"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Separe por vírgula.
            </p>
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
              placeholder="Escreva aqui em markdown..."
              className="mt-1 min-h-[420px] font-mono text-sm"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WriterEditor;
