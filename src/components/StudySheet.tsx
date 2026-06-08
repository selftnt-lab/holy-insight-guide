import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, BookOpen, Lightbulb, ListTree, Heart, MessageCircleQuestion, Check } from "lucide-react";
import { useChapterStudy } from "@/hooks/useChapterStudy";
import { useReflectionAnswers } from "@/hooks/useReflectionAnswers";

interface Props {
  open: boolean;
  onClose: () => void;
  bookSlug: string;
  bookName: string;
  chapter: number;
  fullText: string;
}

const StudySheet = ({ open, onClose, bookSlug, bookName, chapter, fullText }: Props) => {
  const { data, loading, error, load } = useChapterStudy(bookSlug, bookName, chapter, fullText);

  useEffect(() => {
    if (open) load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookSlug, chapter]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Estudo: {bookName} {chapter}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => load(true)}
              disabled={loading}
              aria-label="Regenerar"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {loading && !data && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <p className="text-center text-xs text-muted-foreground">
              Gerando estudo do capítulo...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <Tabs defaultValue="context" className="mt-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="context" aria-label="Contexto">
                <BookOpen size={14} />
              </TabsTrigger>
              <TabsTrigger value="themes" aria-label="Temas">
                <Lightbulb size={14} />
              </TabsTrigger>
              <TabsTrigger value="outline" aria-label="Esboço">
                <ListTree size={14} />
              </TabsTrigger>
              <TabsTrigger value="application" aria-label="Aplicação">
                <Heart size={14} />
              </TabsTrigger>
              <TabsTrigger value="reflection" aria-label="Reflexão">
                <MessageCircleQuestion size={14} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contexto</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{data.context}</p>
            </TabsContent>

            <TabsContent value="themes" className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temas principais</h3>
              <ul className="mt-2 space-y-2">
                {data.themes?.map((t, i) => (
                  <li key={i} className="rounded-lg bg-muted/40 p-3 text-sm">{t}</li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="outline" className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Esboço</h3>
              <ol className="mt-2 space-y-2">
                {data.outline?.map((o, i) => (
                  <li key={i} className="border-l-2 border-accent/60 pl-3 text-sm">{o}</li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="application" className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aplicação</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{data.application}</p>
            </TabsContent>

            <TabsContent value="reflection" className="mt-4">
              <ReflectionTab
                bookSlug={bookSlug}
                chapter={chapter}
                questions={data.questions ?? []}
              />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

const ReflectionTab = ({
  bookSlug,
  chapter,
  questions,
}: {
  bookSlug: string;
  chapter: number;
  questions: string[];
}) => {
  const { answers, save } = useReflectionAnswers(bookSlug, chapter, questions);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  useEffect(() => {
    const d: Record<number, string> = {};
    Object.values(answers).forEach((a) => {
      d[a.question_index] = a.answer;
    });
    setDrafts(d);
  }, [answers]);

  useEffect(() => {
    const timers: number[] = [];
    Object.entries(drafts).forEach(([k, v]) => {
      const i = Number(k);
      if (answers[i] && v !== answers[i].answer) {
        const t = window.setTimeout(async () => {
          setSavingIdx(i);
          await save(i, v);
          setSavingIdx(null);
        }, 800);
        timers.push(t);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [drafts, answers, save]);

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const filled = (drafts[i] ?? "").trim().length > 0;
        return (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{q}</p>
              {filled && <Check size={14} className="ml-auto shrink-0 text-accent" />}
            </div>
            <Textarea
              value={drafts[i] ?? ""}
              onChange={(e) => setDrafts((s) => ({ ...s, [i]: e.target.value }))}
              placeholder="Sua resposta..."
              className="mt-2 min-h-[80px] text-sm"
            />
            {savingIdx === i && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 size={10} className="animate-spin" /> salvando…
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudySheet;
