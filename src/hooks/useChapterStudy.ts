import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ChapterStudyContent {
  context: string;
  themes: string[];
  outline: string[];
  application: string;
  questions: string[];
}

export const useChapterStudy = (
  bookSlug: string,
  bookName: string,
  chapter: number,
  fullText: string,
) => {
  const { user } = useAuth();
  const [data, setData] = useState<ChapterStudyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (regenerate = false) => {
      if (!user || !bookSlug || !chapter) return;
      setError(null);
      setLoading(true);
      try {
        if (!regenerate) {
          const { data: cached } = await supabase
            .from("chapter_studies")
            .select("content")
            .eq("user_id", user.id)
            .eq("book_slug", bookSlug)
            .eq("chapter", chapter)
            .maybeSingle();
          if (cached?.content) {
            setData(cached.content as unknown as ChapterStudyContent);
            setLoading(false);
            return;
          }
        }
        if (!fullText) {
          setLoading(false);
          return;
        }
        const { data: gen, error: fnErr } = await supabase.functions.invoke(
          "chapter-study",
          { body: { bookSlug, bookName, chapter, text: fullText } },
        );
        if (fnErr) throw fnErr;
        if (gen?.error) throw new Error(gen.error);
        const content = gen as ChapterStudyContent;
        setData(content);
        await supabase.from("chapter_studies").upsert(
          {
            user_id: user.id,
            book_slug: bookSlug,
            chapter,
            content: content as never,
          },
          { onConflict: "user_id,book_slug,chapter" },
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao gerar estudo");
      } finally {
        setLoading(false);
      }
    },
    [user, bookSlug, bookName, chapter, fullText],
  );

  useEffect(() => {
    setData(null);
  }, [bookSlug, chapter]);

  return { data, loading, error, load };
};
