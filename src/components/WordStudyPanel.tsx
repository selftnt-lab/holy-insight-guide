import { useState } from "react";
import { Sparkles, Volume2, AlertCircle, Languages } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWordStudy } from "@/hooks/useWordStudy";
import StrongDetailSheet from "@/components/StrongDetailSheet";

interface Props {
  open: boolean;
  onClose: () => void;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  word: string;
  wordIndex: number;
  onAskTutor?: (params: {
    topicName: string;
    description: string;
    initialPrompt: string;
  }) => void;
  onNavigate?: (bookSlug: string, chapter: number) => void;
}

const speak = (text: string, lang = "el-GR") => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

const WordStudyPanel = ({
  open,
  onClose,
  bookSlug,
  bookName,
  chapter,
  verse,
  verseText,
  word,
  wordIndex,
  onAskTutor,
  onNavigate,
}: Props) => {
  const [strongDetailCode, setStrongDetailCode] = useState<string | null>(null);
  const { data, loading, error } = useWordStudy({
    bookSlug,
    chapter,
    verse,
    verseText,
    word,
    wordIndex,
    enabled: open && !!word,
  });

  const ttsLang =
    data?.language === "greek"
      ? "el-GR"
      : data?.language === "hebrew" || data?.language === "aramaic"
      ? "he-IL"
      : "pt-BR";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-y-auto rounded-t-2xl px-5 sm:max-w-lg sm:mx-auto"
      >
        <SheetHeader className="text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            {bookName} {chapter}:{verse} · Estudo de palavra
          </p>
          <SheetTitle className="font-serif text-2xl">
            "{word}"
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  Não foi possível gerar o estudo
                </p>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="mt-5 space-y-5">
            {/* Original word block */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-3xl leading-tight text-foreground">
                    {data.original}
                  </p>
                  <p className="mt-1 text-sm italic text-muted-foreground">
                    {data.transliteration}
                    {data.pronunciation
                      ? ` · ${data.pronunciation}`
                      : ""}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => speak(data.original, ttsLang)}
                  aria-label="Ouvir pronúncia"
                >
                  <Volume2 size={18} />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {data.strong_code}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  <Languages size={12} className="mr-1" />
                  {data.language === "hebrew"
                    ? "Hebraico"
                    : data.language === "aramaic"
                    ? "Aramaico"
                    : "Grego"}
                </Badge>
                {data.part_of_speech && (
                  <Badge variant="outline" className="text-xs">
                    {data.part_of_speech}
                  </Badge>
                )}
                {typeof data.confidence === "number" &&
                  data.confidence < 0.7 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/50 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                      Identificação aproximada
                    </Badge>
                  )}
              </div>
            </div>

            {/* Significados */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Significado principal
              </h3>
              <p className="mt-1 text-sm text-foreground">
                {data.short_definition}
              </p>
              {data.full_definition && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {data.full_definition}
                </p>
              )}
            </section>

            {data.secondary_meanings?.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Significados secundários
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {data.secondary_meanings.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Neste versículo
              </h3>
              <p className="mt-1 text-sm text-foreground">
                {data.context_meaning}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Notas linguísticas
              </h3>
              <div className="prose prose-sm mt-1 max-w-none text-foreground dark:prose-invert prose-p:my-1">
                <ReactMarkdown>{data.contextual_explanation}</ReactMarkdown>
              </div>
            </section>

            <Button
              variant="default"
              className="w-full gap-2 rounded-full"
              onClick={() =>
                onAskTutor?.({
                  topicName: `${data.original} (${data.strong_code})`,
                  description: `${word} — ${data.short_definition}`,
                  initialPrompt: `Aprofunde o estudo da palavra "${data.original}" (${data.transliteration}, ${data.strong_code}) no contexto de ${bookName} ${chapter}:${verse}: "${verseText}". Foque em aspectos linguísticos e literários, sem vieses doutrinários.`,
                })
              }
            >
              <Sparkles size={16} />
              Aprofundar com Tutor IA
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WordStudyPanel;
