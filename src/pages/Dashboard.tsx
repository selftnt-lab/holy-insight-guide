import { Play, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProgress } from "@/lib/reading-progress";
import { getBookBySlug } from "@/lib/bible-books";

const Dashboard = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const progress = getProgress();
  const book = getBookBySlug(progress.bookSlug);
  const bookName = book?.name || "Gênesis";
  const totalChapters = book?.chapters || 50;
  const pct = Math.round((progress.chapter / totalChapters) * 100);
  const chaptersRead = progress.chaptersRead.length;

  const continueReading = () => {
    navigate(`/reading?book=${progress.bookSlug}&chapter=${progress.chapter}`);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">📖 Guia Bíblico</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {greeting}, <span className="text-primary">leitor</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Lendo: {bookName}</span>
            <span className="text-muted-foreground">
              {progress.chapter} de {totalChapters} capítulos
            </span>
          </div>
          <Progress value={pct} className="mt-2 h-2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6"
        >
          <Card className="relative overflow-hidden rounded-2xl border-0 bg-primary p-5 text-primary-foreground shadow-lg">
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
                Abra o capítulo e toque no botão de faísca para conversar com o tutor.
              </p>
              <button
                onClick={continueReading}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Play size={14} fill="currentColor" />
                </div>
                Abrir agora
              </button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6"
        >
          <Button
            onClick={continueReading}
            className="w-full rounded-2xl py-7 text-base font-semibold shadow-md"
            size="lg"
          >
            <BookOpen size={20} className="mr-2" />
            Continuar Leitura
            <ChevronRight size={18} className="ml-auto" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Capítulos lidos", value: String(chaptersRead) },
            { label: "Livro atual", value: bookName.split(" ")[0] },
            { label: "Capítulo", value: String(progress.chapter) },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-xl border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
