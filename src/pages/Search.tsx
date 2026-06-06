import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { History, BookOpen, Hash, Type } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BIBLE_BOOKS, getBookBySlug } from "@/lib/bible-books";
import { parseReference, isStrongCode } from "@/lib/reference-parser";
import { useStrongSearch } from "@/hooks/useStrongSearch";
import { toast } from "sonner";

const HISTORY_KEY = "holy-insight:search-history";

type Mode = "idle" | "reference" | "strong" | "text";

interface TextResult {
  chapter: number;
  verse: number;
  text: string;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [textBookSlug, setTextBookSlug] = useState("john");
  const [textResults, setTextResults] = useState<TextResult[]>([]);
  const [textLoading, setTextLoading] = useState(false);
  const [textTruncated, setTextTruncated] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Strong reuse
  const strongQuery = mode === "strong" ? query.toUpperCase() : "";
  const { data: strongData, loading: strongLoading } = useStrongSearch(strongQuery, mode === "strong");
  const strongResults = strongData?.results ?? [];


  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const saveHistory = (q: string) => {
    const next = [q, ...history.filter((x) => x !== q)].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const textBook = useMemo(() => getBookBySlug(textBookSlug) ?? BIBLE_BOOKS[0], [textBookSlug]);

  const runTextSearch = async (q: string, bookSlug: string) => {
    const book = getBookBySlug(bookSlug);
    if (!book) return;
    setTextLoading(true);
    setTextResults([]);
    setTextTruncated(false);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-search?q=${encodeURIComponent(q)}&book=${encodeURIComponent(bookSlug)}&chapters=${book.chapters}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Erro");
      setTextResults(j.results || []);
      setTextTruncated(!!j.truncated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na busca");
    } finally {
      setTextLoading(false);
    }
  };

  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    saveHistory(q);

    // Try Strong first
    if (isStrongCode(q)) {
      setMode("strong");
      return;
    }
    // Try reference
    const ref = parseReference(q);
    if (ref) {
      navigate(`/reading?book=${encodeURIComponent(ref.book.slug)}&chapter=${ref.chapter}`);
      return;
    }
    // Fallback: text search
    setMode("text");
    runTextSearch(q, textBookSlug);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg px-5 pt-6">
        <motion.h1
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-2xl font-semibold mb-4"
        >
          Buscar
        </motion.h1>

        <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} autoFocus />

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> "jo 3:16"
          </span>
          <span className="flex items-center gap-1">
            <Type size={12} /> "pelo amor de Deus"
          </span>
          <span className="flex items-center gap-1">
            <Hash size={12} /> "G26"
          </span>
        </div>

        {/* Idle: history */}
        {mode === "idle" && history.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <History size={12} /> Recentes
            </h2>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setQuery(h);
                    setTimeout(handleSubmit, 0);
                  }}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Strong results */}
        {mode === "strong" && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-3">Léxico Strong</h2>
            {strongLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : strongResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum resultado para {strongQuery}.</p>
            ) : (
              <div className="space-y-2">
                {strongResults.map((s) => (
                  <Card key={s.strong_code} className="rounded-xl p-3">
                    <p className="font-semibold">
                      {s.strong_code}
                      {s.entry?.original ? ` · ${s.entry.original}` : ""}
                    </p>
                    {s.entry?.transliteration && (
                      <p className="text-xs text-muted-foreground">{s.entry.transliteration}</p>
                    )}
                    {s.entry?.short_definition && (
                      <p className="mt-1 text-sm">{s.entry.short_definition}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {s.count} ocorrência(s)
                    </p>
                  </Card>
                ))}
              </div>

            )}
          </div>
        )}

        {/* Text results */}
        {mode === "text" && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Livro:</label>
              <select
                value={textBookSlug}
                onChange={(e) => {
                  setTextBookSlug(e.target.value);
                  runTextSearch(query.trim(), e.target.value);
                }}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                {BIBLE_BOOKS.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {textLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : textResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum versículo em {textBook.name} contém "{query}".
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted-foreground">
                  {textResults.length} resultado(s) em {textBook.name}
                  {textTruncated ? " (limitado a 50)" : ""}
                </p>
                <div className="space-y-2">
                  {textResults.map((r) => (
                    <Card
                      key={`${r.chapter}-${r.verse}`}
                      className="rounded-xl p-3 cursor-pointer hover:bg-muted/40"
                      onClick={() => navigate(`/reading?book=${encodeURIComponent(textBookSlug)}&chapter=${r.chapter}`)}
                    >
                      <Badge variant="secondary" className="text-[10px]">
                        {textBook.name} {r.chapter}:{r.verse}
                      </Badge>
                      <p className="mt-1 font-serif text-sm leading-relaxed">{r.text}</p>
                    </Card>
                  ))}
                </div>
                {textTruncated && (
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => toast.info("Refine a busca para ver mais.")}>
                    Refine para mais resultados
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
