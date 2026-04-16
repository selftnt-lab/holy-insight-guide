import { useEffect, useState } from "react";

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapterData {
  reference: string;
  translation: string;
  verses: BibleVerse[];
}

const BIBLE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible`;

export const useBibleChapter = (bookSlug: string, chapter: number) => {
  const [data, setData] = useState<BibleChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const url = `${BIBLE_URL}?book=${encodeURIComponent(bookSlug)}&chapter=${chapter}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Erro ao carregar");
        return j as BibleChapterData;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Erro desconhecido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapter]);

  return { data, loading, error };
};
