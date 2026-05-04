import { Languages, AlertCircle, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStrongDetail } from "@/hooks/useStrongDetail";
import { getBookBySlug } from "@/lib/bible-books";

interface Props {
  open: boolean;
  onClose: () => void;
  code: string | null;
  onNavigate?: (bookSlug: string, chapter: number) => void;
}

const StrongDetailSheet = ({ open, onClose, code, onNavigate }: Props) => {
  const { data, loading, error } = useStrongDetail(code, open);

  const langLabel =
    data?.entry?.language === "hebrew"
      ? "Hebraico"
      : data?.entry?.language === "aramaic"
      ? "Aramaico"
      : data?.entry?.language === "greek"
      ? "Grego"
      : null;

  // Sort frequency desc
  const freqEntries = data
    ? Object.entries(data.freq_by_book).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[88vh] overflow-y-auto rounded-t-2xl px-5 sm:max-w-lg sm:mx-auto"
      >
        <SheetHeader className="text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            Concordância Strong
          </p>
          <SheetTitle className="font-mono text-lg">{code}</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="mt-5 space-y-5">
            {data.entry && (
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-serif text-3xl leading-tight text-foreground">
                  {data.entry.original}
                </p>
                <p className="mt-1 text-sm italic text-muted-foreground">
                  {data.entry.transliteration}
                  {data.entry.pronunciation
                    ? ` · ${data.entry.pronunciation}`
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {langLabel && (
                    <Badge variant="outline" className="text-xs">
                      <Languages size={12} className="mr-1" />
                      {langLabel}
                    </Badge>
                  )}
                  {data.entry.part_of_speech && (
                    <Badge variant="outline" className="text-xs">
                      {data.entry.part_of_speech}
                    </Badge>
                  )}
                </div>
                {data.entry.short_definition && (
                  <p className="mt-3 text-sm text-foreground">
                    {data.entry.short_definition}
                  </p>
                )}
                {data.entry.full_definition && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {data.entry.full_definition}
                  </p>
                )}
              </div>
            )}

            {/* Frequência */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Frequência ({data.total}{" "}
                {data.total === 1 ? "ocorrência" : "ocorrências"} mapeadas)
              </h3>
              {freqEntries.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhuma outra ocorrência mapeada ainda. Conforme você for
                  estudando palavras, mais aparecerão aqui.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {freqEntries.map(([slug, count]) => {
                    const b = getBookBySlug(slug);
                    return (
                      <Badge
                        key={slug}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {b?.name || slug} · {count}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Ocorrências */}
            {data.occurrences.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Onde aparece
                </h3>
                <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                  {data.occurrences.map((o, i) => {
                    const b = getBookBySlug(o.book_slug);
                    return (
                      <li key={i}>
                        <button
                          onClick={() => {
                            onNavigate?.(o.book_slug, o.chapter);
                            onClose();
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {b?.name || o.book_slug} {o.chapter}:{o.verse}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              "{o.word_pt}"
                              {o.context_meaning ? ` — ${o.context_meaning}` : ""}
                            </p>
                          </div>
                          <ArrowRight
                            size={14}
                            className="shrink-0 text-muted-foreground"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default StrongDetailSheet;
