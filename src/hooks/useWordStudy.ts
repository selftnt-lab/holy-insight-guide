import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WordStudy {
  strong_code: string;
  language: "hebrew" | "greek" | "aramaic";
  original: string;
  transliteration: string;
  pronunciation: string;
  short_definition: string;
  full_definition: string;
  part_of_speech: string;
  context_meaning: string;
  secondary_meanings: string[];
  contextual_explanation: string;
  confidence: number;
}

interface Args {
  bookSlug: string;
  chapter: number;
  verse: number;
  verseText: string;
  word: string;
  wordIndex: number;
  enabled: boolean;
}

// In-memory cache for the session
const memoryCache = new Map<string, WordStudy>();

export const useWordStudy = ({
  bookSlug,
  chapter,
  verse,
  verseText,
  word,
  wordIndex,
  enabled,
}: Args) => {
  const [data, setData] = useState<WordStudy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || !word) return;
    const key = `${bookSlug}:${chapter}:${verse}:${word.toLowerCase()}`;
    const cached = memoryCache.get(key);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }

    const myReq = ++reqId.current;
    setLoading(true);
    setError(null);
    setData(null);

    supabase.functions
      .invoke("word-study", {
        body: { bookSlug, chapter, verse, verseText, wordPt: word, wordIndex },
      })
      .then(({ data, error }) => {
        if (myReq !== reqId.current) return;
        if (error) throw error;
        const payload = (data as any)?.study as WordStudy | undefined;
        if (!payload) throw new Error((data as any)?.error || "Sem dados");
        memoryCache.set(key, payload);
        setData(payload);
      })
      .catch((e) => {
        if (myReq !== reqId.current) return;
        setError(e.message || "Erro ao carregar estudo");
      })
      .finally(() => {
        if (myReq !== reqId.current) return;
        setLoading(false);
      });
  }, [bookSlug, chapter, verse, verseText, word, wordIndex, enabled]);

  return { data, loading, error };
};
