import { motion } from "framer-motion";
import { Sparkles, Check, Loader2, ArrowRight, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDailyDevotional } from "@/hooks/useDailyDevotional";

const DevotionalCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, verse, loading, error, completedAt, markComplete } = useDailyDevotional();

  const share = async () => {
    const text = `"${verse.text}"\n— ${verse.reference}\n\n${data?.meditation ?? ""}\n\nLido em Holy Insight`;
    try {
      if (navigator.share) await navigator.share({ title: verse.reference, text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Devocional copiado" });
      }
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden rounded-2xl border-accent/20 bg-gradient-to-br from-accent/10 via-background to-background p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Devocional de hoje
          </span>
          {completedAt && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-accent">
              <Check size={12} /> concluído
            </span>
          )}
        </div>

        <p className="mt-3 font-serif text-base leading-relaxed text-foreground">
          “{verse.text}”
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{verse.reference}</p>

        {loading && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-destructive">Não foi possível carregar agora. Tente em alguns segundos.</p>
        )}

        {data && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meditação</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{data.meditation}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reflita</p>
              <p className="mt-1 text-sm italic text-foreground">{data.question}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Oração</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{data.prayer}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              navigate(`/reading?book=${encodeURIComponent(verse.bookSlug)}&chapter=${verse.chapter}`)
            }
            className="rounded-full"
          >
            Ler capítulo <ArrowRight size={14} className="ml-1" />
          </Button>
          <Button size="sm" variant="outline" onClick={share} className="rounded-full">
            <Share2 size={14} className="mr-1" /> Compartilhar
          </Button>
          {!completedAt && data && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markComplete}
              className="ml-auto rounded-full text-accent"
            >
              <Check size={14} className="mr-1" /> Marcar feito
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DevotionalCard;
