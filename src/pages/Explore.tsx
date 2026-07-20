import PageSeo from "@/components/PageSeo";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, MapPin, User, Lightbulb, HelpCircle, BookOpen, Search, Sparkles, Languages, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AiChat, { type TopicContext } from "@/components/AiChat";
import StrongDetailSheet from "@/components/StrongDetailSheet";
import { useAuth } from "@/hooks/useAuth";
import { useStrongSearch } from "@/hooks/useStrongSearch";
import { supabase } from "@/integrations/supabase/client";
import { fetchProgress } from "@/lib/reading-progress";
import { getBookBySlug } from "@/lib/bible-books";

type CardType = "lugar" | "personagem" | "tema" | "pergunta";

interface ExploreCard {
  type: CardType;
  title: string;
  description: string;
  prompt: string;
  gradient: string;
}

const FALLBACK_CARDS: ExploreCard[] = [
  {
    type: "lugar",
    title: "Jerusalém",
    description: "A cidade sagrada, centro da fé judaica e cristã.",
    prompt: "Conte a história de Jerusalém na Bíblia e por que é tão importante.",
    gradient: "from-amber-800/80 to-amber-950/90",
  },
  {
    type: "lugar",
    title: "Mar da Galileia",
    description: "Onde Jesus caminhou sobre as águas e chamou seus discípulos.",
    prompt: "Quais episódios bíblicos aconteceram no Mar da Galileia?",
    gradient: "from-sky-700/80 to-sky-950/90",
  },
  {
    type: "personagem",
    title: "Moisés",
    description: "Líder que conduziu Israel para fora do Egito.",
    prompt: "Conte a trajetória de Moisés segundo a Bíblia.",
    gradient: "from-orange-800/80 to-orange-950/90",
  },
  {
    type: "tema",
    title: "Aliança",
    description: "O pacto entre Deus e seu povo ao longo das Escrituras.",
    prompt: "O que é aliança na Bíblia e como ela se desenvolve do AT ao NT?",
    gradient: "from-indigo-700/80 to-indigo-950/90",
  },
  {
    type: "pergunta",
    title: "Por que sofrer?",
    description: "O que a Bíblia diz sobre o sofrimento humano.",
    prompt: "O que a Bíblia ensina sobre o sofrimento e o silêncio de Deus?",
    gradient: "from-teal-700/80 to-teal-950/90",
  },
  {
    type: "lugar",
    title: "Éden",
    description: "O jardim original descrito em Gênesis.",
    prompt: "O que a Bíblia diz sobre o Jardim do Éden?",
    gradient: "from-emerald-700/80 to-emerald-950/90",
  },
];

const TYPE_META: Record<
  CardType,
  { label: string; Icon: typeof MapPin }
> = {
  lugar: { label: "Lugar", Icon: MapPin },
  personagem: { label: "Personagem", Icon: User },
  tema: { label: "Tema", Icon: Lightbulb },
  pergunta: { label: "Pergunta", Icon: HelpCircle },
};

const Explore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState<TopicContext | null>(null);
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookName, setBookName] = useState<string>("");
  const [chapter, setChapter] = useState<number>(1);
  const [chaptersReadCount, setChaptersReadCount] = useState(0);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"ask" | "word">("ask");
  const [wordQuery, setWordQuery] = useState("");
  const [activeWordSearch, setActiveWordSearch] = useState<string | null>(null);
  const [strongDetailCode, setStrongDetailCode] = useState<string | null>(null);

  const { data: searchData, loading: searchLoading, error: searchError } =
    useStrongSearch(activeWordSearch, mode === "word");

  const QUICK_PROMPTS = [
    "O que é graça?",
    "Quem foi Paulo?",
    "Por que existem 4 evangelhos?",
    "O que é o Reino de Deus?",
  ];

  const QUICK_WORDS = ["amor", "graça", "fé", "Senhor", "espírito"];

  const handleAsk = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setTopic({
      topicName: "Pergunta livre",
      description: q.length > 80 ? q.slice(0, 80) + "…" : q,
      initialPrompt: q,
    });
    setQuery("");
  };

  const loadCards = async (force = false) => {
    if (!user) return;
    force ? setRefreshing(true) : setLoading(true);
    try {
      const progress = await fetchProgress(user.id);
      const book = getBookBySlug(progress.bookSlug);
      const name = book?.name ?? "Gênesis";
      setBookName(name);
      setChapter(progress.chapter);
      setChaptersReadCount(progress.chaptersRead.length);

      const { data, error } = await supabase.functions.invoke(
        "explore-suggestions",
        {
          body: {
            bookName: name,
            bookSlug: progress.bookSlug,
            chapter: progress.chapter,
          },
        }
      );

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const fetched: ExploreCard[] = (data as any)?.cards ?? [];
      if (fetched.length > 0) {
        setCards(fetched);
      } else {
        setCards(FALLBACK_CARDS);
      }
    } catch (e) {
      console.error("loadCards error", e);
      setCards(FALLBACK_CARDS);
      toast({
        title: "Usando sugestões padrão",
        description:
          "Não foi possível gerar sugestões personalizadas agora.",
        variant: "default",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen pb-32">
      <PageSeo title="Explorar — RC Bible" description="Descubra insights bíblicos: personagens, lugares, temas e perguntas para aprofundar seu estudo com a IA." path="/explore" />
      <div className="mx-auto max-w-lg px-5 pt-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
          {bookName ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen size={14} className="text-accent" />
              Sugestões para{" "}
              <span className="font-semibold text-foreground">
                {bookName} {chapter}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Sugestões personalizadas para sua leitura.
            </p>
          )}
          {chaptersReadCount > 0 && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              {chaptersReadCount}{" "}
              {chaptersReadCount === 1 ? "capítulo lido" : "capítulos lidos"}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5"
        >
          <Tabs value={mode} onValueChange={(v) => setMode(v as "ask" | "word")}>
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="ask" className="rounded-full text-xs">
                <Sparkles size={13} className="mr-1.5" />
                Pergunta livre
              </TabsTrigger>
              <TabsTrigger value="word" className="rounded-full text-xs">
                <Languages size={13} className="mr-1.5" />
                Palavra / Strong
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ask" className="mt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk(query);
                }}
              >
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pergunte qualquer coisa sobre a Bíblia..."
                    className="h-11 rounded-full border-border/60 bg-card/60 pl-9 pr-12 text-sm shadow-sm focus-visible:ring-accent"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!query.trim()}
                    aria-label="Perguntar ao tutor"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
                  >
                    <Sparkles size={15} />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setQuery(p)}
                      className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="word" className="mt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = wordQuery.trim();
                  if (!t) return;
                  if (/^[GH]\d{1,5}$/i.test(t)) {
                    setStrongDetailCode(t.toUpperCase());
                  } else {
                    setActiveWordSearch(t);
                  }
                }}
              >
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={wordQuery}
                    onChange={(e) => setWordQuery(e.target.value)}
                    placeholder='Buscar "amor" ou "G3056"...'
                    className="h-11 rounded-full border-border/60 bg-card/60 pl-9 pr-12 text-sm shadow-sm focus-visible:ring-accent"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!wordQuery.trim()}
                    aria-label="Buscar palavra"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
                  >
                    <ArrowRight size={15} />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_WORDS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setWordQuery(w);
                        setActiveWordSearch(w);
                      }}
                      className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/80">
                  Busca em palavras já estudadas no app. Toque em palavras
                  durante a leitura para alimentar a base.
                </p>

                {searchLoading && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Buscando ocorrências...
                  </div>
                )}
                {searchError && !searchLoading && (
                  <p className="mt-4 text-sm text-destructive">{searchError}</p>
                )}
                {searchData && !searchLoading && (
                  <div className="mt-4">
                    {searchData.results.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum resultado para "{searchData.query}". Tente outra
                        palavra ou explore um capítulo para mapear novas
                        palavras.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {searchData.results.map((g) => (
                          <li key={g.strong_code}>
                            <button
                              onClick={() => setStrongDetailCode(g.strong_code)}
                              className="w-full rounded-xl border border-border bg-card/50 p-3 text-left transition-colors hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  {g.entry?.original && (
                                    <p className="font-serif text-lg leading-tight text-foreground">
                                      {g.entry.original}
                                      {g.entry.transliteration && (
                                        <span className="ml-2 text-xs italic text-muted-foreground">
                                          {g.entry.transliteration}
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {g.entry?.short_definition && (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                      {g.entry.short_definition}
                                    </p>
                                  )}
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                  <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px]"
                                  >
                                    {g.strong_code}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {g.count}{" "}
                                    {g.count === 1 ? "ocor." : "ocors."}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        {mode === "ask" && (
          <>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadCards(true)}
                disabled={loading || refreshing}
                className="gap-1.5 text-xs"
              >
                <RefreshCw
                  size={12}
                  className={refreshing ? "animate-spin" : ""}
                />
                Atualizar
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
                Preparando sugestões para o seu capítulo...
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                {cards.map((card, i) => {
                  const meta = TYPE_META[card.type] ?? TYPE_META.tema;
                  const Icon = meta.Icon;
                  return (
                    <motion.div
                      key={`${card.title}-${i}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Card
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setTopic({
                            topicName: card.title,
                            description: card.description,
                            initialPrompt: card.prompt,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setTopic({
                              topicName: card.title,
                              description: card.description,
                              initialPrompt: card.prompt,
                            });
                          }
                        }}
                        className={`relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${card.gradient} p-4 text-white shadow-md cursor-pointer transition-transform active:scale-[0.97] h-44 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-accent`}
                      >
                        <div className="flex items-center gap-1 self-start rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                          <Icon size={10} />
                          {meta.label}
                        </div>
                        <div>
                          <h3 className="text-base font-bold leading-tight">
                            {card.title}
                          </h3>
                          <p className="mt-1 text-[11px] leading-snug opacity-80">
                            {card.description}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <StrongDetailSheet
        open={!!strongDetailCode}
        code={strongDetailCode}
        onClose={() => setStrongDetailCode(null)}
      />


      <AnimatePresence>
        {topic && <AiChat onClose={() => setTopic(null)} topic={topic} />}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
