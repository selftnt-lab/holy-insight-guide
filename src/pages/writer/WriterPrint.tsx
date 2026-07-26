import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Loader2, Printer, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserDocument, DOC_TYPE_LABEL } from "@/hooks/useUserDocuments";
import { findBibleReferences } from "@/lib/bible-reference-scan";

/** Underline detected bible refs (no anchors — this is a print view). */
const renderPrintRefs = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === "string") {
    const matches = findBibleReferences(children);
    if (!matches.length) return children;
    const out: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m, i) => {
      if (m.start > cursor) out.push(children.slice(cursor, m.start));
      out.push(
        <span key={i} className="underline underline-offset-2">
          {children.slice(m.start, m.end)}
        </span>,
      );
      cursor = m.end;
    });
    if (cursor < children.length) out.push(children.slice(cursor));
    return out;
  }
  if (Array.isArray(children)) return children.map((c) => renderPrintRefs(c));
  return children;
};

const WriterPrint = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: doc, isLoading, isError } = useUserDocument(id);

  useEffect(() => {
    if (doc && params.get("auto") === "1") {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [doc, params]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError || !doc) {
    return (
      <div className="min-h-screen p-8 text-center text-sm text-muted-foreground">
        Documento não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black print:bg-white">
      <style>{`
        @media print {
          @page { margin: 20mm; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-5 py-3 backdrop-blur">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/writer/${id}`)}>
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </Button>
        <Button size="sm" onClick={() => window.print()} className="rounded-full">
          <Printer size={14} className="mr-1.5" /> Imprimir / Salvar PDF
        </Button>
      </div>

      <article className="mx-auto max-w-[720px] px-8 py-10 font-serif print:px-0 print:py-0">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          {DOC_TYPE_LABEL[doc.type]}
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">
          {doc.title || "Sem título"}
        </h1>
        {doc.tags.length > 0 && (
          <p className="mt-2 text-sm italic text-neutral-600">
            {doc.tags.join(" · ")}
          </p>
        )}
        <hr className="my-6 border-neutral-300" />
        <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-p:leading-relaxed">
          {doc.content_md.trim() ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p>{renderPrintRefs(children)}</p>,
                li: ({ children }) => <li>{renderPrintRefs(children)}</li>,
                h1: ({ children }) => <h1>{renderPrintRefs(children)}</h1>,
                h2: ({ children }) => <h2>{renderPrintRefs(children)}</h2>,
                h3: ({ children }) => <h3>{renderPrintRefs(children)}</h3>,
                h4: ({ children }) => <h4>{renderPrintRefs(children)}</h4>,
                blockquote: ({ children }) => (
                  <blockquote>{renderPrintRefs(children)}</blockquote>
                ),
                strong: ({ children }) => <strong>{renderPrintRefs(children)}</strong>,
                em: ({ children }) => <em>{renderPrintRefs(children)}</em>,
              }}
            >
              {doc.content_md}
            </ReactMarkdown>
          ) : (
            <p className="italic text-neutral-500">Documento vazio.</p>
          )}
        </div>
      </article>
    </div>
  );
};

export default WriterPrint;
