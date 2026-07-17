import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Sparkles, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchProgress, type ReadingProgress } from "@/lib/reading-progress";
import { getBookBySlug } from "@/lib/bible-books";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { resolveFirstName, type ProfileNameSource } from "@/lib/user-name";
import AiChat from "@/components/AiChat";
import SacredDivider from "@/components/SacredDivider";
import DevotionalCard from "@/components/DevotionalCard";
import StreakBadge from "@/components/StreakBadge";
import VerseOfDayCard from "@/components/VerseOfDayCard";
import ReadingProgressRing from "@/components/dashboard/ReadingProgressRing";
import ActivePlansMini from "@/components/dashboard/ActivePlansMini";
import RecentHighlightsMini from "@/components/dashboard/RecentHighlightsMini";
import RecentNotesMini from "@/components/dashboard/RecentNotesMini";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const [progress, setProgress] = useState<ReadingProgress>({
    bookSlug: "genesis",
    chapter: 1,
    chaptersRead: [],
  });
  const [profileName, setProfileName] = useState<ProfileNameSource | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchProgress(user.id).then(setProgress);
    supabase
      .from("profiles")
      .select("full_name, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfileName(data ?? null));
  }, [user]);

  const book = getBookBySlug(progress.bookSlug);
  const bookName = book?.name || "Gênesis";
  const totalChapters = book?.chapters || 50;
  const pct = Math.round((progress.chapter / totalChapters) * 100);
  const readerName = resolveFirstName(user, profileName);

  const continueReading = () => {
    navigate(`/reading?book=${progress.bookSlug}&chapter=${progress.chapter}`);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-lg px-5 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            RC Bible · Guia Bíblico
          </p>
          <h1
            data-testid="dashboard-greeting"
            className="mt-3 font-serif text-4xl font-normal leading-[1.05] text-foreground"
          >
            {greeting},<br />
            <span className="uppercase tracking-tight">{readerName}</span>
          </h1>
          <SacredDivider className="mt-5" />
        </motion.div>

        {/* Streak */}
        <div className="mt-6">
          <StreakBadge />
        </div>

        {/* Versículo do Dia — hero card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-4"
        >
          <VerseOfDayCard />
        </motion.div>

        {/* Grid: Progresso + Planos Ativos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-5 grid grid-cols-2 gap-3"
        >
          <ReadingProgressRing value={pct} />
          <ActivePlansMini />
        </motion.div>

        {/* Grid: Destaques + Notas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          <RecentHighlightsMini />
          <RecentNotesMini />
        </motion.div>

        {/* Devocional de hoje */}
        <div className="mt-5">
          <DevotionalCard />
        </div>

        {/* Continuar leitura */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-4"
        >
          <Button
            onClick={continueReading}
            className="w-full rounded-3xl py-7 text-base font-semibold shadow-float"
            size="lg"
          >
            <BookOpen size={20} className="mr-2" />
            Continuar {bookName} {progress.chapter}
            <ChevronRight size={18} className="ml-auto" />
          </Button>
        </motion.div>

        {/* Tutor IA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3"
        >
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-primary p-5 text-primary-foreground shadow-float">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent/20" />
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-accent/10" />
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                Tutor IA
              </span>
              <h2 className="mt-3 text-lg font-bold leading-tight">
                Pergunte sobre {bookName} {progress.chapter}
              </h2>
              <p className="mt-2 text-sm opacity-80">
                Tire dúvidas sobre o capítulo direto com o Tutor IA.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Sparkles size={14} />
                </div>
                Conversar agora
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Planos link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-3"
        >
          <button
            onClick={() => navigate("/plans")}
            className="flex w-full items-center justify-between rounded-3xl border border-border/60 bg-card px-5 py-4 text-left transition-colors hover:bg-accent/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CalendarCheck size={18} />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-foreground">
                  Planos de leitura
                </p>
                <p className="text-xs text-muted-foreground">
                  Bíblia em 1 ano, NT em 90 dias, Provérbios…
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showChat && (
          <AiChat
            onClose={() => setShowChat(false)}
            topic={{
              topicName: `${bookName} ${progress.chapter}`,
              description: `Capítulo atual da sua leitura.`,
              initialPrompt: `Me dê um resumo de ${bookName} ${progress.chapter}.`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
