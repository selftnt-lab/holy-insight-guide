import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Share2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getVerseOfDay, type VerseOfDay } from "@/lib/verse-of-day";

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
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-scripture"
    >
      {/* Subtle accent halos — sem imagem, mantendo o editorial */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent-glow/10 blur-2xl"
      />

      <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          Versículo do Dia
        </span>
        <p className="mt-4 font-serif text-xl leading-snug text-foreground">
          “{verse.text}”
        </p>
        <p className="mt-3 text-sm font-medium text-muted-foreground">— {verse.reference}</p>

        <div className="mt-5 flex items-center gap-2">
          <Button
            size="sm"
            onClick={open}
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Ler capítulo <ArrowRight size={14} className="ml-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={share}
            className="rounded-full border-border"
          >
            <Share2 size={14} className="mr-1" /> Compartilhar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerseOfDayCard;
