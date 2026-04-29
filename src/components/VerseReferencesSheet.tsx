import { useState } from "react";
import { Link2, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getBookByName } from "@/lib/bible-books";

interface CrossRef {
  book: string;
  chapter: number;
  verse_start: number;
  verse_end?: number;
  connection: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  onNavigate: (slug: string, chapter: number) => void;
}

const VerseReferencesSheet = ({
  open,
  onClose,
  bookName,
  chapter,
  verse,
  verseText,
  onNavigate,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>("");
  const [refs, setRefs] = useState<CrossRef[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchRefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "cross-references",
        { body: { bookName, chapter, verse, verseText } }
      );
      if (fnError) throw fnError;
      if ((data as any)?.error) throw new Error((data as any).error);
      setTheme((data as any).theme || "");
      setRefs((data as any).references || []);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar referências.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (r: CrossRef) => {
    const book = getBookByName(r.book);
    if (!book) {
      setError(`Livro não reconhecido: ${r.book}`);
      return;
    }
    const ch = Math.min(Math.max(r.chapter, 1), book.chapters);
    onNavigate(book.slug, ch);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[56] max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted" />

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {bookName} {chapter}:{verse}
          </p>
          <h2 className="mt-1 font-serif text-lg font-bold text-foreground">
            Versículos sobre o mesmo tema
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Referências cruzadas baseadas na tradição protestante.
          </p>
        </div>

        {!loaded && !loading && !error && (
          <Button onClick={fetchRefs} className="w-full gap-2">
            <Link2 size={16} />
            Buscar referências cruzadas
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Procurando paralelos bíblicos...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchRefs}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {loaded && refs.length > 0 && (
          <div className="space-y-3">
            {theme && (
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tema
                </p>
                <p className="mt-1 text-sm text-foreground">{theme}</p>
              </div>
            )}
            {refs.map((r, i) => {
              const known = !!getBookByName(r.book);
              const label = `${r.book} ${r.chapter}:${r.verse_start}${
                r.verse_end && r.verse_end !== r.verse_start ? `-${r.verse_end}` : ""
              }`;
              return (
                <button
                  key={i}
                  onClick={() => known && handleNavigate(r)}
                  disabled={!known}
                  className="group w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    {known && (
                      <ArrowRight
                        size={14}
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.connection}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VerseReferencesSheet;
