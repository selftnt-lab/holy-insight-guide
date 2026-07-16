import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getHighlightBg } from "@/lib/highlight-colors";
import { getBookBySlug } from "@/lib/bible-books";

interface HL {
  id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  color: string | null;
  note: string | null;
}

const RecentHighlightsMini = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<HL[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("highlights")
      .select("id, book_slug, chapter, verse, color, note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2)
      .then(({ data }) => setItems((data as HL[]) ?? []));
  }, [user]);

  return (
    <Card className="rounded-3xl border-border/60 bg-card p-4 shadow-scripture">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Destaques Recentes
      </p>

      {items.length === 0 ? (
        <button
          onClick={() => navigate("/reading")}
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-dashed border-border/70 p-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Marque seu primeiro versículo
        </button>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((h) => {
            const bookName = getBookBySlug(h.book_slug)?.name ?? h.book_slug;
            return (
              <li key={h.id}>
                <button
                  onClick={() =>
                    navigate(`/reading?book=${h.book_slug}&chapter=${h.chapter}&verse=${h.verse}`)
                  }
                  className="w-full rounded-2xl bg-muted/60 px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {bookName} {h.chapter}:{h.verse}
                  </p>
                  <div
                    className={`mt-1 h-1.5 w-16 rounded-full ${getHighlightBg(h.color) || "bg-accent/30"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default RecentHighlightsMini;
