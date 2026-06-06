import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getBookBySlug } from "@/lib/bible-books";
import { HIGHLIGHT_COLORS, getHighlightBg } from "@/lib/highlight-colors";
import { toast } from "sonner";

interface Row {
  id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  color: string;
  note: string | null;
  tags: string[];
  updated_at: string;
}

const HighlightsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState("");

  const load = () => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("verse_highlights")
      .select("id, book_slug, chapter, verse, color, note, tags, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(load, [user]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterColor && r.color !== filterColor) return false;
      if (filterTag) {
        const t = filterTag.toLowerCase();
        if (!r.tags.some((tag) => tag.toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [rows, filterColor, filterTag]);

  const handleDelete = async (id: string) => {
    await supabase.from("verse_highlights").delete().eq("id", id);
    setRows((p) => p.filter((r) => r.id !== id));
    toast.success("Removido");
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum destaque ainda. Toque e segure num versículo para começar.
      </p>
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterColor(null)}
          className={`rounded-full border px-3 py-1 text-xs ${!filterColor ? "bg-primary text-primary-foreground" : ""}`}
        >
          Todas
        </button>
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterColor(filterColor === c.id ? null : c.id)}
            className={`h-7 w-7 rounded-full ${c.bg} ${filterColor === c.id ? `ring-2 ${c.ring}` : ""}`}
            aria-label={c.label}
          />
        ))}
        <Input
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          placeholder="Filtrar por tag"
          className="h-8 w-40 text-sm"
        />
      </div>

      {filtered.map((r) => {
        const book = getBookBySlug(r.book_slug);
        return (
          <Card key={r.id} className={`p-3 rounded-xl ${getHighlightBg(r.color)}`}>
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => navigate(`/reading?book=${encodeURIComponent(r.book_slug)}&chapter=${r.chapter}`)}
                className="text-left flex-1"
              >
                <p className="text-xs font-semibold text-accent">
                  {book?.name ?? r.book_slug} {r.chapter}:{r.verse}
                </p>
                {r.note && <p className="mt-1 text-sm text-foreground/90">{r.note}</p>}
                {r.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        <Tag size={10} className="mr-1" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(r.id)}
                aria-label="Remover"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default HighlightsList;
