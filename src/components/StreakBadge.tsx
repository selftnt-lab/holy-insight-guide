import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fetchStreak, type StreakInfo } from "@/lib/streak";
import { useAuth } from "@/hooks/useAuth";

const StreakBadge = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  const [info, setInfo] = useState<StreakInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchStreak(user.id).then(setInfo);
  }, [user]);

  if (!info) return null;

  const active = info.readToday;
  const count = info.streakCount;
  const longest = info.longestStreak;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-4 py-3",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Flame size={20} strokeWidth={2.2} />
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Sequência {active ? "ativa" : "em pausa"}
        </p>
        <p className="font-serif text-lg font-semibold text-foreground">
          {count} {count === 1 ? "dia" : "dias"}
          {longest > count && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              · recorde {longest}
            </span>
          )}
        </p>
      </div>
      {!active && count > 0 && (
        <span className="text-[11px] text-muted-foreground">Leia hoje para continuar</span>
      )}
    </motion.div>
  );
};

export default StreakBadge;
