import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AiChat, { type TopicContext } from "@/components/AiChat";

const places: Array<{
  name: string;
  desc: string;
  tag: string;
  gradient: string;
  prompt: string;
}> = [
  {
    name: "Jerusalém",
    desc: "A cidade sagrada, centro da fé judaica e cristã.",
    tag: "Mapa 3D",
    gradient: "from-amber-800/80 to-amber-950/90",
    prompt: "Conte a história de Jerusalém na Bíblia e por que é tão importante.",
  },
  {
    name: "Mar da Galileia",
    desc: "Onde Jesus caminhou sobre as águas e chamou seus discípulos.",
    tag: "Cultura",
    gradient: "from-sky-700/80 to-sky-950/90",
    prompt: "Quais episódios bíblicos aconteceram no Mar da Galileia?",
  },
  {
    name: "Monte Sinai",
    desc: "Onde Moisés recebeu os Dez Mandamentos.",
    tag: "Mapa 3D",
    gradient: "from-orange-800/80 to-orange-950/90",
    prompt: "Conte sobre o Monte Sinai e os Dez Mandamentos.",
  },
  {
    name: "Belém",
    desc: "Cidade do nascimento de Jesus Cristo.",
    tag: "Cultura",
    gradient: "from-indigo-700/80 to-indigo-950/90",
    prompt: "Por que Jesus nasceu em Belém? Conte o contexto histórico.",
  },
  {
    name: "Rio Jordão",
    desc: "Local do batismo de Jesus por João Batista.",
    tag: "Mapa 3D",
    gradient: "from-teal-700/80 to-teal-950/90",
    prompt: "Qual a importância do Rio Jordão na Bíblia?",
  },
  {
    name: "Éden",
    desc: "O jardim original descrito em Gênesis.",
    tag: "Cultura",
    gradient: "from-emerald-700/80 to-emerald-950/90",
    prompt: "O que a Bíblia diz sobre o Jardim do Éden?",
  },
];

const Explore = () => {
  const [topic, setTopic] = useState<TopicContext | null>(null);

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque em um lugar para conversar com o Tutor IA
          </p>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {places.map((place, i) => (
            <motion.div
              key={place.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                role="button"
                tabIndex={0}
                onClick={() =>
                  setTopic({
                    topicName: place.name,
                    description: place.desc,
                    initialPrompt: place.prompt,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setTopic({
                      topicName: place.name,
                      description: place.desc,
                      initialPrompt: place.prompt,
                    });
                  }
                }}
                className={`relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${place.gradient} p-4 text-white shadow-md cursor-pointer transition-transform active:scale-[0.97] h-40 flex flex-col justify-end focus:outline-none focus:ring-2 focus:ring-accent`}
              >
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-3 bg-white/20 text-white text-[10px] backdrop-blur-sm border-0"
                >
                  {place.tag}
                </Badge>
                <h3 className="text-base font-bold leading-tight">{place.name}</h3>
                <p className="mt-1 text-[11px] leading-snug opacity-80">
                  {place.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {topic && <AiChat onClose={() => setTopic(null)} topic={topic} />}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
