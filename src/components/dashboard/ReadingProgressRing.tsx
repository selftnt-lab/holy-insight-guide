import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  value: number; // 0-100
  label?: string;
}

const ReadingProgressRing = ({ value, label = "Progresso de Leitura" }: Props) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <Card className="flex flex-col items-center rounded-3xl border-border/60 bg-card p-4 shadow-scripture">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
        {label}
      </p>
      <div className="relative mt-2 h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none stroke-muted"
            strokeWidth="7"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none stroke-accent transition-[stroke-dashoffset] duration-700"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <BookOpen size={16} className="text-muted-foreground" />
          <span className="font-serif text-base font-semibold text-foreground">
            {clamped}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ReadingProgressRing;
