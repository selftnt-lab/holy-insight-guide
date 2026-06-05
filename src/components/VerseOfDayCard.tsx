import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Share2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
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
    const text = `"${verse.text}"\n— ${verse.reference}\n\nLido em Holy Insight`;
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
    >
      <Card className="relative overflow-hidden rounded-2xl border-accent/20 bg-gradient-to-br from-accent/10 via-background to-background p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Versículo do dia
          </span>
        </div>
        <p className="mt-3 font-serif text-base leading-relaxed text-foreground">
          “{verse.text}”
        </p>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{verse.reference}</p>
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" variant="default" onClick={open} className="rounded-full">
            Ler capítulo <ArrowRight size={14} className="ml-1" />
          </Button>
          <Button size="sm" variant="outline" onClick={share} className="rounded-full">
            <Share2 size={14} className="mr-1" /> Compartilhar
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default VerseOfDayCard;
