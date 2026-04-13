import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const places = [
  {
    name: "Jerusalém",
    desc: "A cidade sagrada, centro da fé judaica e cristã.",
    tag: "Mapa 3D",
    gradient: "from-amber-800/80 to-amber-950/90",
  },
  {
    name: "Mar da Galileia",
    desc: "Onde Jesus caminhou sobre as águas e chamou seus discípulos.",
    tag: "Cultura",
    gradient: "from-sky-700/80 to-sky-950/90",
  },
  {
    name: "Monte Sinai",
    desc: "Onde Moisés recebeu os Dez Mandamentos.",
    tag: "Mapa 3D",
    gradient: "from-orange-800/80 to-orange-950/90",
  },
  {
    name: "Belém",
    desc: "Cidade do nascimento de Jesus Cristo.",
    tag: "Cultura",
    gradient: "from-indigo-700/80 to-indigo-950/90",
  },
  {
    name: "Rio Jordão",
    desc: "Local do batismo de Jesus por João Batista.",
    tag: "Mapa 3D",
    gradient: "from-teal-700/80 to-teal-950/90",
  },
  {
    name: "Éden",
    desc: "O jardim original descrito em Gênesis.",
    tag: "Cultura",
    gradient: "from-emerald-700/80 to-emerald-950/90",
  },
];

const Explore = () => {
  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mergulhe na história e cultura bíblica
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
                className={`relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${place.gradient} p-4 text-white shadow-md cursor-pointer transition-transform active:scale-[0.97] h-40 flex flex-col justify-end`}
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
    </div>
  );
};

export default Explore;
