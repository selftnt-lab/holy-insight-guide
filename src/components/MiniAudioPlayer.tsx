import { Play, Pause, SkipBack, SkipForward, X, Volume2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/contexts/AudioPlayerProvider";

const MiniAudioPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    target,
    playing,
    paused,
    currentVerse,
    pause,
    resume,
    stop,
    next,
    prev,
  } = useAudioPlayer();

  if (!target || location.pathname === "/auth") return null;
  if (!playing && !paused) return null;

  const onReader = location.pathname === "/reading";

  const openReading = () => {
    const params = new URLSearchParams({
      book: target.bookSlug,
      chapter: String(target.chapter),
    });
    if (currentVerse) params.set("verse", String(currentVerse));
    navigate(`/reading?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-xl pointer-events-auto">
        <button
          onClick={onReader ? undefined : openReading}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          disabled={onReader}
          aria-label="Voltar para a leitura"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Volume2 size={14} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {target.bookName} {target.chapter}
              {currentVerse ? `:${currentVerse}` : ""}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {paused ? "Pausado" : "Narrando…"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-0.5">
          <button
            onClick={prev}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Versículo anterior"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={paused ? resume : pause}
            className="rounded-full bg-primary p-1.5 text-primary-foreground"
            aria-label={paused ? "Continuar" : "Pausar"}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={next}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Próximo versículo"
          >
            <SkipForward size={14} />
          </button>
          <button
            onClick={stop}
            className="ml-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Fechar player"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniAudioPlayer;
