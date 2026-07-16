import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Share2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getVerseOfDay, type VerseOfDay } from "@/lib/verse-of-day";
import landscape from "@/assets/verse-landscape.jpg";

const VerseOfDayCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verse, setVerse] = useState<VerseOfDay | null>(null);

  useEffect(() => {
    setVerse(getVerseOfDay());
  }, []);

  if (!verse) return null;

  const share = async () => {
    const text = `"${verse.text}"\n— ${verse.reference}\n\nLido em RC Bible`;
    try {
      if (navigator.share) {
        await navigator.share({ title: verse.reference, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Versículo copiado", description: "Cole onde quiser compartilhar." });
      }
    } catch {
      // user cancelled
    }
  };

  const open = () =>
    navigate(`/reading?book=${encodeURIComponent(verse.bookSlug)}&chapter=${verse.chapter}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl shadow-float"
    >
      <img
        src={landscape}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Warm readable overlay — tuned for both themes */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background/70 dark:from-black/55 dark:via-black/40 dark:to-black/75" />

      <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/70">
          Versículo do Dia
        </span>
        <p className="mt-4 font-serif text-xl leading-snug text-foreground drop-shadow-sm">
          “{verse.text}”
        </p>
        <p className="mt-3 text-sm font-medium text-foreground/80">— {verse.reference}</p>

        <div className="mt-5 flex items-center gap-2">
          <Button size="sm" onClick={open} className="rounded-full">
            Ler capítulo <ArrowRight size={14} className="ml-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={share}
            className="rounded-full border-foreground/20 bg-background/70 backdrop-blur"
          >
            <Share2 size={14} className="mr-1" /> Compartilhar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerseOfDayCard;
