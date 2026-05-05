import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MappedWord {
  verse: number;
  word_index: number;
  word_pt: string;
  strong_code: string | null;
}

// Cache por livro+capítulo na sessão
const cache = new Map<string, MappedWord[]>();

export const useChapterWordMap = (bookSlug: string, chapter: number) => {
  const [data, setData] = useState<MappedWord[]>(() => {
    return cache.get(`${bookSlug}:${chapter}`) ?? [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const key = `${bookSlug}:${chapter}`;
    const cached = cache.get(key);
    if (cached) {
      setData(cached);
      return;
    }
    setLoading(true);
    supabase
      .from("verse_word_map")
      .select("verse, word_index, word_pt, strong_code")
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter)
      .then(({ data: rows, error }) => {
        if (!active) return;
        if (error) {
          console.warn("useChapterWordMap error", error);
          setData([]);
        } else {
          const list = (rows ?? []) as MappedWord[];
          cache.set(key, list);
          setData(list);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookSlug, chapter]);

  return { data, loading };
};
