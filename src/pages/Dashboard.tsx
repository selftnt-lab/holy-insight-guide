import { Play, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">📖 Guia Bíblico</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {greeting}, <span className="text-primary">Maxwell</span>
          </h1>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Trilha: Gênesis</span>
            <span className="text-muted-foreground">3 de 50 capítulos</span>
          </div>
          <Progress value={6} className="mt-2 h-2" />
        </motion.div>

        {/* Contexto do Dia */}
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
                Contexto do Dia
              </span>
              <h2 className="mt-3 text-lg font-bold leading-tight">
                Por que Deus criou o mundo em 7 dias?
              </h2>
              <p className="mt-2 text-sm opacity-80">
                Entenda o significado simbólico por trás da narrativa da criação.
              </p>
              <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Play size={14} fill="currentColor" />
                </div>
                Ouvir agora
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Continue Reading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6"
        >
          <Button
            onClick={() => navigate("/reading")}
            className="w-full rounded-2xl py-7 text-base font-semibold shadow-md"
            size="lg"
          >
            <BookOpen size={20} className="mr-2" />
            Continuar Leitura
            <ChevronRight size={18} className="ml-auto" />
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Dias seguidos", value: "7 🔥" },
            { label: "Capítulos lidos", value: "3" },
            { label: "Palavras salvas", value: "12" },
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
