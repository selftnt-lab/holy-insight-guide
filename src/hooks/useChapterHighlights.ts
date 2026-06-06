import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface VerseHighlight {
  id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  color: string;
  note: string | null;
  tags: string[];
}

export const useChapterHighlights = (bookSlug: string, chapter: number) => {
  const { user } = useAuth();
  const [items, setItems] = useState<VerseHighlight[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("verse_highlights")
      .select("id, book_slug, chapter, verse, color, note, tags")
      .eq("user_id", user.id)
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter);
    if (!error && data) setItems(data as VerseHighlight[]);
    setLoading(false);
  }, [user, bookSlug, chapter]);

  useEffect(() => {
    load();
  }, [load]);

  const upsert = useCallback(
    async (verse: number, patch: Partial<Pick<VerseHighlight, "color" | "note" | "tags">>) => {
      if (!user) return;
      const existing = items.find((h) => h.verse === verse);
      const row = {
        user_id: user.id,
        book_slug: bookSlug,
        chapter,
        verse,
        color: patch.color ?? existing?.color ?? "yellow",
        note: patch.note !== undefined ? patch.note : existing?.note ?? null,
        tags: patch.tags ?? existing?.tags ?? [],
      };
      const { data, error } = await supabase
        .from("verse_highlights")
        .upsert(row, { onConflict: "user_id,book_slug,chapter,verse" })
        .select()
        .single();
      if (!error && data) {
        setItems((prev) => {
          const others = prev.filter((h) => h.verse !== verse);
          return [...others, data as VerseHighlight];
        });
      }
    },
    [user, bookSlug, chapter, items]
  );

  const remove = useCallback(
    async (verse: number) => {
      if (!user) return;
      await supabase
        .from("verse_highlights")
        .delete()
        .eq("user_id", user.id)
        .eq("book_slug", bookSlug)
        .eq("chapter", chapter)
        .eq("verse", verse);
      setItems((prev) => prev.filter((h) => h.verse !== verse));
    },
    [user, bookSlug, chapter]
  );

  const byVerse = (verse: number) => items.find((h) => h.verse === verse);

  return { items, loading, upsert, remove, byVerse, reload: load };
};
