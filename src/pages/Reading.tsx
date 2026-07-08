import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, BookOpen, AlertCircle, Languages, Maximize2, Minimize2, GraduationCap } from "lucide-react";
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
import VerseActionSheet from "@/components/VerseActionSheet";
import TranslationComparison from "@/components/TranslationComparison";
import ReadingAudioControls from "@/components/ReadingAudioControls";
import StudySheet from "@/components/StudySheet";
import { BIBLE_BOOKS, getBookBySlug } from "@/lib/bible-books";
import { BIBLE_TRANSLATIONS, getStoredTranslation, setStoredTranslation } from "@/lib/bible-translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBibleChapter } from "@/hooks/useBibleChapter";
import { useChapterWordMap } from "@/hooks/useChapterWordMap";
import { useChapterHighlights } from "@/hooks/useChapterHighlights";
import { getHighlightBg } from "@/lib/highlight-colors";
import { fetchProgress, saveProgress } from "@/lib/reading-progress";
import { useAuth } from "@/hooks/useAuth";
import { useAudioPlayer } from "@/contexts/AudioPlayerProvider";

const Reading = () => {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [bookSlug, setBookSlug] = useState(params.get("book") || "genesis");
  const [chapter, setChapter] = useState(Number(params.get("chapter")) || 1);
  const [translation, setTranslation] = useState<string>(() => getStoredTranslation());
  const [showChat, setShowChat] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navStep, setNavStep] = useState<"book" | "chapter" | "verse">("book");
  const [navBookSlug, setNavBookSlug] = useState<string>(bookSlug);
  const [navChapter, setNavChapter] = useState<number>(chapter);
  const [hydrated, setHydrated] = useState(false);
  const [activeVerse, setActiveVerse] = useState<{ verse: number; text: string } | null>(null);
  const [activeWord, setActiveWord] = useState<{
    verse: number;
    text: string;
    word: string;
    wordIndex: number;
  } | null>(null);
  const [chatTopic, setChatTopic] = useState<TopicContext | null>(null);
  const [actionVerse, setActionVerse] = useState<{ verse: number; text: string } | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareVerse, setCompareVerse] = useState<number | undefined>(undefined);
  const [immersive, setImmersive] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const verseRefs = useRef<Map<number, HTMLParagraphElement>>(new Map());
  const [flashVerse, setFlashVerse] = useState<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const triggerFlash = (verse: number) => {
    if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    setFlashVerse(verse);
    flashTimeoutRef.current = window.setTimeout(() => setFlashVerse(null), 2400);
  };
  const audio = useAudioPlayer();
  const initialVerseParam = params.get("verse");

  const book = getBookBySlug(bookSlug) || BIBLE_BOOKS[0];
  const { data, loading, error } = useBibleChapter(bookSlug, chapter, translation);

  const handleTranslationChange = (code: string) => {
    setTranslation(code);
    setStoredTranslation(code);
  };
  const { data: wordMap } = useChapterWordMap(bookSlug, chapter);
  const { upsert, remove, byVerse } = useChapterHighlights(bookSlug, chapter);
  const [chaptersRead, setChaptersRead] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchProgress(user.id).then((p) => {
      const set = new Set<number>();
      for (const tag of p.chaptersRead) {
        const [slug, n] = tag.split(":");
        if (slug === bookSlug) set.add(Number(n));
      }
      setChaptersRead(set);
    });
  }, [user, bookSlug, chapter]);

  const mappedIndex = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of wordMap) {
      if (w.strong_code) m.set(`${w.verse}:${w.word_index}`, w.strong_code);
    }
    return m;
  }, [wordMap]);

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
    const next: Record<string, string> = { book: bookSlug, chapter: String(chapter) };
    if (initialVerseParam) next.verse = initialVerseParam;
    setParams(next, { replace: true });
    if (!initialVerseParam) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookSlug, chapter, setParams, user, hydrated, initialVerseParam]);

  // Load user preference for immersive mode
  useEffect(() => {
    const v = localStorage.getItem("reading.immersive");
    if (v === "true") setImmersive(true);
  }, []);

  // Scroll to ?verse= once data is loaded (retries until the verse node exists)
  const didJumpRef = useRef(false);
  useEffect(() => {
    // Reset jump flag whenever target verse/chapter/book changes
    didJumpRef.current = false;
  }, [initialVerseParam, bookSlug, chapter]);

  useEffect(() => {
    if (didJumpRef.current || !data || !initialVerseParam) return;
    const v = Number(initialVerseParam);
    if (!Number.isFinite(v) || v <= 0) return;

    let cancelled = false;
    let attempts = 0;
    const tryScroll = () => {
      if (cancelled || didJumpRef.current) return;
      const el = verseRefs.current.get(v);
      if (el) {
        // Position the verse near the top of the viewport, accounting for sticky chrome
        const y = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        didJumpRef.current = true;
        triggerFlash(v);
        return;
      }
      if (attempts++ < 30) requestAnimationFrame(tryScroll);
    };
    requestAnimationFrame(tryScroll);
    return () => {
      cancelled = true;
    };
  }, [data, initialVerseParam]);


  // Auto-scroll to currently narrated verse
  useEffect(() => {
    if (
      !audio.currentVerse ||
      audio.target?.bookSlug !== bookSlug ||
      audio.target?.chapter !== chapter
    )
      return;
    const el = verseRefs.current.get(audio.currentVerse);
    if (el) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }
  }, [audio.currentVerse, audio.target, bookSlug, chapter]);

  const toggleImmersive = () => {
    setImmersive((p) => {
      const next = !p;
      localStorage.setItem("reading.immersive", String(next));
      if (next) setChromeVisible(false);
      else setChromeVisible(true);
      return next;
    });
  };

  // Toggle chrome hidden class on body so header/nav can react
  useEffect(() => {
    const hidden = immersive && !chromeVisible;
    document.body.classList.toggle("chrome-hidden", hidden);
    return () => document.body.classList.remove("chrome-hidden");
  }, [immersive, chromeVisible]);

  const goPrev = () => chapter > 1 && setChapter(chapter - 1);
  const goNext = () => chapter < book.chapters && setChapter(chapter + 1);

  // Keyboard shortcuts: ← / → para navegar entre capítulos (desktop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chapter, book.chapters]);

  // Long press handling
  const pressTimer = useRef<number | null>(null);
  const pressMoved = useRef(false);
  const startPress = (verse: number, text: string) => {
    pressMoved.current = false;
    pressTimer.current = window.setTimeout(() => {
      setActionVerse({ verse, text });
    }, 450);
  };
  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const fullText = data
    ? data.verses.map((v) => `${v.verse}. ${v.text}`).join("\n")
    : "";

  return (
    <div
      className="min-h-screen pb-28 bg-background text-foreground transition-colors"
      data-immersive={immersive ? "true" : undefined}
      onClick={(e) => {
        if (!immersive) return;
        // Only toggle chrome when clicking the empty container (not interactive children)
        if (e.target === e.currentTarget) setChromeVisible((v) => !v);
      }}
    >
      <div className="mx-auto max-w-lg px-5 pt-10">
        {/* Selectors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-2"
        >
          <Sheet
            open={navOpen}
            onOpenChange={(open) => {
              setNavOpen(open);
              if (open) {
                // Reset the wizard to book step whenever it reopens
                setNavStep("book");
                setNavBookSlug(bookSlug);
                setNavChapter(chapter);
              }
            }}
          >
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start gap-2 rounded-full">
                <BookOpen size={16} />
                <span className="truncate">
                  {book.name} {chapter}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              {(() => {
                const navBook = getBookBySlug(navBookSlug) || book;
                const verseCount = data?.verses.length ?? 0;
                return (
                  <div className="flex h-full flex-col">
                    {/* Header with breadcrumb */}
                    <div className="flex items-center gap-2 border-b px-5 py-4">
                      {navStep !== "book" && (
                        <button
                          type="button"
                          onClick={() =>
                            setNavStep(navStep === "verse" ? "chapter" : "book")
                          }
                          className="rounded-full p-1.5 hover:bg-muted"
                          aria-label="Voltar"
                        >
                          <ChevronLeft size={18} />
                        </button>
                      )}
                      <div className="flex-1 text-sm">
                        <button
                          type="button"
                          onClick={() => setNavStep("book")}
                          className={`transition-colors ${
                            navStep === "book"
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {navStep === "book" ? "Escolha um livro" : navBook.name}
                        </button>
                        {navStep !== "book" && (
                          <>
                            <span className="mx-1 text-muted-foreground">·</span>
                            <button
                              type="button"
                              onClick={() => setNavStep("chapter")}
                              className={`transition-colors ${
                                navStep === "chapter"
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {navStep === "chapter"
                                ? "Escolha um capítulo"
                                : `Cap. ${navChapter}`}
                            </button>
                          </>
                        )}
                        {navStep === "verse" && (
                          <>
                            <span className="mx-1 text-muted-foreground">·</span>
                            <span className="font-semibold text-foreground">
                              Versículo
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Book step */}
                    {navStep === "book" && (
                      <div className="flex-1 overflow-y-auto px-5 py-4">
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
                                    setNavBookSlug(b.slug);
                                    setNavChapter(1);
                                    setNavStep("chapter");
                                  }}
                                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    b.slug === navBookSlug
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
                    )}

                    {/* Chapter step */}
                    {navStep === "chapter" && (
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="grid grid-cols-6 gap-2 overflow-y-auto px-5 py-4">
                          {Array.from({ length: navBook.chapters }, (_, i) => i + 1).map((n) => {
                            const isCurrent =
                              navBookSlug === bookSlug && n === chapter;
                            const read = navBookSlug === bookSlug && chaptersRead.has(n);
                            return (
                              <button
                                key={n}
                                onClick={() => {
                                  setNavChapter(n);
                                  // Commit book+chapter immediately, then offer verse step
                                  setBookSlug(navBookSlug);
                                  setChapter(n);
                                  setNavStep("verse");
                                }}
                                className={`relative aspect-square rounded-lg text-sm font-medium transition-colors ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : read
                                    ? "bg-accent/15 text-foreground hover:bg-accent/25"
                                    : "bg-muted hover:bg-muted/70"
                                }`}
                                aria-label={`Capítulo ${n}${read ? " (já lido)" : ""}`}
                              >
                                {n}
                                {read && !isCurrent && (
                                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Verse step */}
                    {navStep === "verse" && (
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                          {loading || verseCount === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              Carregando versículos…
                            </p>
                          ) : (
                            <div className="grid grid-cols-6 gap-2">
                              {Array.from({ length: verseCount }, (_, i) => i + 1).map((n) => (
                                <button
                                  key={n}
                                  onClick={() => {
                                    setParams((prev) => {
                                      const next = new URLSearchParams(prev);
                                      next.set("book", bookSlug);
                                      next.set("chapter", String(chapter));
                                      next.set("verse", String(n));
                                      return next;
                                    });
                                    didJumpRef.current = false;
                                    setNavOpen(false);

                                    // Imperative scroll: wait for the sheet's close animation
                                    // to release the scroll lock, then retry until the node is painted.
                                    let attempts = 0;
                                    const tryScroll = () => {
                                      const el = verseRefs.current.get(n);
                                      if (el) {
                                        const y =
                                          el.getBoundingClientRect().top + window.scrollY - 96;
                                        window.scrollTo({
                                          top: Math.max(0, y),
                                          behavior: "smooth",
                                        });
                                        didJumpRef.current = true;
                                        triggerFlash(n);
                                        return;
                                      }
                                      if (attempts++ < 40) {
                                        requestAnimationFrame(tryScroll);
                                      }
                                    };
                                    setTimeout(tryScroll, 320);
                                  }}
                                  className="aspect-square rounded-lg bg-muted text-sm font-medium transition-colors hover:bg-muted/70"
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="border-t px-5 py-3">
                          <Button
                            variant="ghost"
                            className="w-full rounded-full"
                            onClick={() => setNavOpen(false)}
                          >
                            Ler capítulo inteiro
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </SheetContent>
          </Sheet>


          <Select value={translation} onValueChange={handleTranslationChange}>
            <SelectTrigger
              className="w-[92px] rounded-full"
              aria-label="Versão da Bíblia"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {BIBLE_TRANSLATIONS.map((t) => (
                <SelectItem key={t.code} value={t.code}>
                  <span className="font-medium">{t.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{t.full}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setCompareVerse(undefined);
              setCompareOpen(true);
            }}
            className="rounded-full"
            aria-label="Comparar traduções"
          >
            <Languages size={16} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleImmersive}
            className="rounded-full"
            aria-label={immersive ? "Sair do modo imersivo" : "Modo imersivo"}
          >
            {immersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </motion.div>

        {/* Audio + Study controls */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStudy(true)}
            className="rounded-full gap-1.5"
          >
            <GraduationCap size={14} />
            Estudar com IA
          </Button>
          <ReadingAudioControls
            bookSlug={bookSlug}
            bookName={book.name}
            chapter={chapter}
          />
        </div>


        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {book.name} · Capítulo {chapter}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            {data?.reference || `${book.name} ${chapter}`}
          </h1>
          <p className="mt-1 text-xs italic text-muted-foreground">
            Almeida Revista e Corrigida · toque e segure para destacar
          </p>
        </motion.div>

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
            {data.verses.map((v) => {
              const hl = byVerse(v.verse);
              const isActive =
                audio.currentVerse === v.verse &&
                audio.target?.bookSlug === bookSlug &&
                audio.target?.chapter === chapter;
              return (
                <p
                  key={v.verse}
                  ref={(el) => {
                    if (el) verseRefs.current.set(v.verse, el);
                    else verseRefs.current.delete(v.verse);
                  }}
                  data-verse={v.verse}
                  onPointerDown={() => startPress(v.verse, v.text)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onPointerCancel={cancelPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActionVerse({ verse: v.verse, text: v.text });
                  }}
                  className={`reading-prose rounded-lg px-2 py-1 font-serif text-lg leading-relaxed text-foreground/90 transition-colors ${getHighlightBg(hl?.color)} ${isActive ? "verse-active" : ""} ${flashVerse === v.verse ? "verse-flash" : ""} select-none`}
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
                    isMapped={(wi) => mappedIndex.get(`${v.verse}:${wi}`) ?? null}
                    onWordClick={(word, wordIndex) =>
                      setActiveWord({
                        verse: v.verse,
                        text: v.text,
                        word,
                        wordIndex,
                      })
                    }
                  />
                  {hl?.note && (
                    <span className="mt-1 block text-xs italic text-muted-foreground border-l-2 border-accent/40 pl-2">
                      {hl.note}
                    </span>
                  )}
                </p>
              );
            })}
          </motion.div>
        )}

        {data && !loading && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={chapter <= 1} className="rounded-full">
              <ChevronLeft size={16} className="mr-1" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {chapter} / {book.chapters}
            </span>
            <Button variant="outline" onClick={goNext} disabled={chapter >= book.chapters} className="rounded-full">
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
            context={data ? { bookName: book.name, chapter, text: fullText } : undefined}
          />
        )}
        {chatTopic && <AiChat onClose={() => setChatTopic(null)} topic={chatTopic} />}
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
        onNavigate={(slug, ch) => {
          setActiveWord(null);
          setBookSlug(slug);
          setChapter(ch);
        }}
      />

      <VerseActionSheet
        open={!!actionVerse}
        onClose={() => setActionVerse(null)}
        bookName={book.name}
        chapter={chapter}
        verse={actionVerse?.verse ?? 0}
        text={actionVerse?.text ?? ""}
        existing={actionVerse ? byVerse(actionVerse.verse) : undefined}
        onUpsert={async (patch) => {
          if (actionVerse) await upsert(actionVerse.verse, patch);
        }}
        onRemove={async () => {
          if (actionVerse) await remove(actionVerse.verse);
        }}
        onCompareTranslations={() => {
          if (actionVerse) {
            setCompareVerse(actionVerse.verse);
            setActionVerse(null);
            setCompareOpen(true);
          }
        }}
      />

      <TranslationComparison
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        bookSlug={bookSlug}
        bookName={book.name}
        chapter={chapter}
        focusVerse={compareVerse}
      />

      <StudySheet
        open={showStudy}
        onClose={() => setShowStudy(false)}
        bookSlug={bookSlug}
        bookName={book.name}
        chapter={chapter}
        fullText={fullText}
      />
    </div>
  );
};

export default Reading;
