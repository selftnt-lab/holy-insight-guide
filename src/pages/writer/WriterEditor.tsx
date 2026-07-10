import { useEffect, useRef, useState } from "react";
import { BookMarked, BookOpen, Share2, Copy, Printer } from "lucide-react";
import InsertReferenceDialog from "@/components/InsertReferenceDialog";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  useCreateDocument,
  useUpdateDocument,
  useUserDocument,
  useDocumentRefs,
  DOC_TYPE_LABEL,
  UserDocType,
  UserDocumentRef,
} from "@/hooks/useUserDocuments";
import SacredDivider from "@/components/SacredDivider";
import { renderChildrenWithBibleRefs } from "@/components/BibleReferenceLink";
import { normalizeUserText, sanitizePastedText } from "@/lib/text-normalize";

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
  const { data: refs = [] } = useDocumentRefs(isNew ? undefined : id);

  const [type, setType] = useState<UserDocType>(initialType);
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [contentMd, setContentMd] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContentMd((prev) => (prev ? `${prev} ${text}` : text));
      return;
    }
    const start = ta.selectionStart ?? contentMd.length;
    const end = ta.selectionEnd ?? contentMd.length;
    const before = contentMd.slice(0, start);
    const after = contentMd.slice(end);
    const needsLeadingSpace = before && !/\s$/.test(before);
    const needsTrailingSpace = after && !/^\s/.test(after);
    const insertion = `${needsLeadingSpace ? " " : ""}${text}${needsTrailingSpace ? " " : ""}`;
    const next = before + insertion + after;
    setContentMd(next);
    const caret = (before + insertion).length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  };

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

        <div className="mt-3 flex items-center justify-between gap-2">
          <Badge variant="secondary">{DOC_TYPE_LABEL[type]}</Badge>
          {!isNew && (
            <div className="flex items-center gap-2">
              <ReferencesSheet refs={refs} />
              <ExportMenu
                onCopy={async () => {
                  try {
                    await navigator.clipboard.writeText(contentMd);
                    toast.success("Markdown copiado");
                  } catch {
                    toast.error("Não foi possível copiar");
                  }
                }}
                onPrint={() => id && navigate(`/writer/${id}/print`)}
              />
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <Label>Conteúdo</Label>
              <InsertReferenceDialog onInsert={insertAtCursor}>
                <Button type="button" variant="outline" size="sm" className="h-8">
                  <BookMarked size={14} className="mr-1.5" />
                  Inserir referência
                </Button>
              </InsertReferenceDialog>
            </div>
            <Tabs defaultValue="edit" className="mt-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  id="content"
                  ref={textareaRef}
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  placeholder="Escreva aqui em markdown... Referências como Jo 3:16, Sl 23 ou 1 Co 13:4-7 ficam clicáveis no Preview."
                  className="min-h-[420px] font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="min-h-[420px] rounded-md border bg-card p-4 prose prose-sm dark:prose-invert max-w-none">
                  {contentMd.trim() ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p>{renderChildrenWithBibleRefs(children)}</p>,
                        li: ({ children }) => <li>{renderChildrenWithBibleRefs(children)}</li>,
                        h1: ({ children }) => <h1>{renderChildrenWithBibleRefs(children)}</h1>,
                        h2: ({ children }) => <h2>{renderChildrenWithBibleRefs(children)}</h2>,
                        h3: ({ children }) => <h3>{renderChildrenWithBibleRefs(children)}</h3>,
                        h4: ({ children }) => <h4>{renderChildrenWithBibleRefs(children)}</h4>,
                        blockquote: ({ children }) => (
                          <blockquote>{renderChildrenWithBibleRefs(children)}</blockquote>
                        ),
                        td: ({ children }) => <td>{renderChildrenWithBibleRefs(children)}</td>,
                        strong: ({ children }) => (
                          <strong>{renderChildrenWithBibleRefs(children)}</strong>
                        ),
                        em: ({ children }) => <em>{renderChildrenWithBibleRefs(children)}</em>,
                      }}
                    >
                      {contentMd}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Escreva algo no Editor para ver o preview aqui.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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

const ExportMenu = ({ onCopy, onPrint }: { onCopy: () => void; onPrint: () => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8">
          <Share2 size={14} className="mr-1.5" /> Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCopy}>
          <Copy size={14} className="mr-2" /> Copiar Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint}>
          <Printer size={14} className="mr-2" /> Imprimir / Salvar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const buildRefHref = (r: UserDocumentRef) => {
  const p = new URLSearchParams();
  p.set("book", r.book_slug);
  p.set("chapter", String(r.chapter));
  if (r.verse_start) p.set("verse", String(r.verse_start));
  return `/reading?${p.toString()}`;
};

const ReferencesSheet = ({ refs }: { refs: UserDocumentRef[] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8">
          <BookOpen size={14} className="mr-1.5" />
          Referências
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
            {refs.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-serif">Referências no texto</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {refs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma referência detectada. Escreva citações como "Jo 3:16" ou "Sl 23" no conteúdo e salve.
            </p>
          ) : (
            <ul className="divide-y">
              {refs.map((r) => {
                const wp = new URLSearchParams();
                wp.set("book", r.book_slug);
                wp.set("chapter", String(r.chapter));
                if (r.verse_start) wp.set("verse", String(r.verse_start));
                return (
                  <li key={r.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <Link to={buildRefHref(r)} className="text-sm font-medium hover:text-primary">
                        {r.ref_raw}
                      </Link>
                      <ChevronLeft size={14} className="rotate-180 text-muted-foreground" />
                    </div>
                    <Link
                      to={`/writer?${wp.toString()}`}
                      className="mt-1 inline-block text-[11px] text-muted-foreground hover:text-primary"
                    >
                      Ver outros documentos com esta referência →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WriterEditor;
