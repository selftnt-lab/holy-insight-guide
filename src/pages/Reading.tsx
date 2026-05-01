import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AiChat, { type TopicContext } from "@/components/AiChat";
import VerseReferencesSheet from "@/components/VerseReferencesSheet";
import ClickableVerse from "@/components/ClickableVerse";
import WordStudyPanel from "@/components/WordStudyPanel";
import { BIBLE_BOOKS, getBookBySlug } from "@/lib/bible-books";
import { useBibleChapter } from "@/hooks/useBibleChapter";
import { fetchProgress, saveProgress } from "@/lib/reading-progress";
import { useAuth } from "@/hooks/useAuth";

const Reading = () => {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [bookSlug, setBookSlug] = useState(params.get("book") || "genesis");
  const [chapter, setChapter] = useState(Number(params.get("chapter")) || 1);
  const [showChat, setShowChat] = useState(false);
  const [bookSheetOpen, setBookSheetOpen] = useState(false);
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeVerse, setActiveVerse] = useState<{ verse: number; text: string } | null>(null);
  const [activeWord, setActiveWord] = useState<{
    verse: number;
    text: string;
    word: string;
    wordIndex: number;
  } | null>(null);
  const [chatTopic, setChatTopic] = useState<TopicContext | null>(null);

  const book = getBookBySlug(bookSlug) || BIBLE_BOOKS[0];
  const { data, loading, error } = useBibleChapter(bookSlug, chapter);

  // Hydrate from DB if no URL params
  useEffect(() => {
    if (!user || hydrated) return;
    if (!params.get("book")) {
      fetchProgress(user.id).then((p) => {
        setBookSlug(p.bookSlug);
        setChapter(p.chapter);
        setHydrated(true);
      });
    } else {
      setHydrated(true);
    }
  }, [user, hydrated, params]);

  useEffect(() => {
    if (user && hydrated) saveProgress(user.id, bookSlug, chapter);
    setParams({ book: bookSlug, chapter: String(chapter) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookSlug, chapter, setParams, user, hydrated]);

  const goPrev = () => {
    if (chapter > 1) setChapter(chapter - 1);
  };
  const goNext = () => {
    if (chapter < book.chapters) setChapter(chapter + 1);
  };

  const fullText = data
    ? data.verses.map((v) => `${v.verse}. ${v.text}`).join("\n")
    : "";

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg px-5 pt-10">
        {/* Selectors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-2"
        >
          <Sheet open={bookSheetOpen} onOpenChange={setBookSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start gap-2 rounded-full">
                <BookOpen size={16} />
                <span className="truncate">{book.name}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Escolha um livro</SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto h-[calc(80vh-80px)]">
                {(["AT", "NT"] as const).map((t) => (
                  <div key={t} className="mb-4">
                    <p className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t === "AT" ? "Antigo Testamento" : "Novo Testamento"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {BIBLE_BOOKS.filter((b) => b.testament === t).map((b) => (
                        <button
                          key={b.slug}
                          onClick={() => {
                            setBookSlug(b.slug);
                            setChapter(1);
                            setBookSheetOpen(false);
                          }}
                          className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            b.slug === bookSlug
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={chapterSheetOpen} onOpenChange={setChapterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full">
                Cap. {chapter}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>{book.name} — Capítulo</SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-6 gap-2 overflow-y-auto h-[calc(60vh-80px)]">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setChapter(n);
                      setChapterSheetOpen(false);
                    }}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                      n === chapter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/70"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {book.name} · Capítulo {chapter}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            {data?.reference || `${book.name} ${chapter}`}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Almeida Revista e Corrigida
          </p>
        </motion.div>

        {/* Content */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Não foi possível carregar</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setChapter(chapter)}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {data.verses.map((v) => (
              <p
                key={v.verse}
                className="rounded-lg px-2 py-1 font-serif text-lg leading-relaxed text-foreground/90"
              >
                <button
                  type="button"
                  onClick={() => setActiveVerse({ verse: v.verse, text: v.text })}
                  className="mr-1 align-super text-xs font-sans font-bold text-accent hover:underline focus:outline-none focus:underline"
                  aria-label={`Ver referências cruzadas do versículo ${v.verse}`}
                >
                  {v.verse}
                </button>
                <ClickableVerse
                  text={v.text}
                  onWordClick={(word, wordIndex) =>
                    setActiveWord({
                      verse: v.verse,
                      text: v.text,
                      word,
                      wordIndex,
                    })
                  }
                />
              </p>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {data && !loading && (
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={chapter <= 1}
              className="rounded-full"
            >
              <ChevronLeft size={16} className="mr-1" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {chapter} / {book.chapters}
            </span>
            <Button
              variant="outline"
              onClick={goNext}
              disabled={chapter >= book.chapters}
              className="rounded-full"
            >
              Próximo <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        onClick={() => setShowChat(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95"
        aria-label="Abrir Tutor IA"
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {showChat && (
          <AiChat
            onClose={() => setShowChat(false)}
            context={
              data
                ? { bookName: book.name, chapter, text: fullText }
                : undefined
            }
          />
        )}
        {chatTopic && (
          <AiChat
            onClose={() => setChatTopic(null)}
            topic={chatTopic}
          />
        )}
      </AnimatePresence>

      <VerseReferencesSheet
        open={!!activeVerse}
        onClose={() => setActiveVerse(null)}
        bookName={book.name}
        chapter={chapter}
        verse={activeVerse?.verse ?? 0}
        verseText={activeVerse?.text ?? ""}
        onNavigate={(slug, ch) => {
          setBookSlug(slug);
          setChapter(ch);
        }}
      />

      <WordStudyPanel
        open={!!activeWord}
        onClose={() => setActiveWord(null)}
        bookSlug={bookSlug}
        bookName={book.name}
        chapter={chapter}
        verse={activeWord?.verse ?? 0}
        verseText={activeWord?.text ?? ""}
        word={activeWord?.word ?? ""}
        wordIndex={activeWord?.wordIndex ?? 0}
        onAskTutor={(t) => {
          setActiveWord(null);
          setChatTopic(t);
        }}
      />
    </div>
  );
};

export default Reading;
