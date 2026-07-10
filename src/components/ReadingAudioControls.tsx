import { Play, Pause, Square, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAudioPlayer } from "@/contexts/AudioPlayerProvider";

interface Props {
  bookSlug: string;
  bookName: string;
  chapter: number;
  translation: string;
  startVerse?: number;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

const ReadingAudioControls = ({ bookSlug, bookName, chapter, translation, startVerse }: Props) => {
  const { target, playing, paused, rate, play, pause, resume, stop, setRate } =
    useAudioPlayer();

  const isThis =
    target?.bookSlug === bookSlug &&
    target?.chapter === chapter &&
    target?.translation === translation;
  const isPlaying = isThis && playing && !paused;
  const isPaused = isThis && paused;

  const onMain = () => {
    if (isPlaying) pause();
    else if (isPaused) resume();
    else play({ bookSlug, bookName, chapter, translation }, startVerse ?? 1);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={onMain}
        className="rounded-full"
        aria-label={isPlaying ? "Pausar narração" : "Ouvir capítulo"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>

      {isThis && (
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          className="rounded-full"
          aria-label="Parar narração"
        >
          <Square size={14} />
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2 text-xs font-mono"
            aria-label="Velocidade"
          >
            <Gauge size={14} className="mr-1" />
            {rate}x
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Velocidade
          </p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                  r === rate
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/70"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReadingAudioControls;
