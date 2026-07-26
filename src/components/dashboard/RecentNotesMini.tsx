import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useUserDocuments } from "@/hooks/useUserDocuments";

const RecentNotesMini = () => {
  const navigate = useNavigate();
  const { data } = useUserDocuments({ type: "all" });
  const notes = (data ?? []).slice(0, 2);

  return (
    <Card className="rounded-3xl border-border/60 bg-card p-4 shadow-scripture">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
        Notas Recentes
      </p>

      {notes.length === 0 ? (
        <button
          onClick={() => navigate("/writer")}
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-dashed border-border/70 p-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Crie sua primeira nota
        </button>
      ) : (
        <ul className="mt-3 space-y-2">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => navigate(`/writer/${n.id}`)}
                className="w-full rounded-2xl bg-muted/60 px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <p className="truncate text-xs font-semibold text-foreground">
                  {n.title || "Sem título"}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {n.content_md.replace(/[#*_>`]/g, "").slice(0, 60) || "—"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default RecentNotesMini;
