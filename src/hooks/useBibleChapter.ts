import { useEffect, useState } from "react";
import { DEFAULT_TRANSLATION } from "@/lib/bible-translations";
import { sanitizeForTranslation, warnIfSuspect, debugCodepoints } from "@/lib/sanitize-bible-text";

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

export const useBibleChapter = (
  bookSlug: string,
  chapter: number,
  translation: string = DEFAULT_TRANSLATION,
) => {
  const [data, setData] = useState<BibleChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!bookSlug || !chapter) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    const url = `${BIBLE_URL}?book=${encodeURIComponent(bookSlug)}&chapter=${chapter}&translation=${encodeURIComponent(translation)}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Erro ao carregar");
        const d = j as BibleChapterData;
        // Single source of truth: sanitize every verse before it reaches
        // the UI, the TTS engine, or the Writer insert pipeline.
        d.verses = (d.verses ?? []).map((v) => {
          // (A) RAW — as it arrives from the dataset/API.
          debugCodepoints(`raw ${bookSlug} ${chapter}:${v.verse} (${translation})`, v.text);
          const clean = sanitizeForTranslation(v.text, translation);
          warnIfSuspect(clean, `${bookSlug} ${chapter}:${v.verse} (${translation})`);
          return { ...v, text: clean };
        });
        return d;
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
  }, [bookSlug, chapter, translation]);

  return { data, loading, error };
};
