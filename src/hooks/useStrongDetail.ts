import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StrongOccurrence {
  book_slug: string;
  chapter: number;
  verse: number;
  word_index: number;
  word_pt: string;
  context_meaning?: string | null;
}

export interface StrongEntry {
  strong_code: string;
  language: "hebrew" | "greek" | "aramaic";
  original: string;
  transliteration?: string;
  pronunciation?: string;
  short_definition?: string;
  full_definition?: string;
  part_of_speech?: string;
}

export interface StrongDetail {
  entry: StrongEntry | null;
  occurrences: StrongOccurrence[];
  total: number;
  freq_by_book: Record<string, number>;
}

const cache = new Map<string, StrongDetail>();

export const useStrongDetail = (code: string | null, enabled: boolean) => {
  const [data, setData] = useState<StrongDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || !code) return;
    const cached = cache.get(code);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }
    const my = ++reqId.current;
    setLoading(true);
    setError(null);
    setData(null);
    supabase.functions
      .invoke("strong-lookup", { method: "GET" as any, body: undefined as any, headers: {} as any })
      .then(() => {}) // placeholder; we'll use direct fetch below
      .catch(() => {});

    // Use direct fetch since invoke doesn't easily support GET query strings
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/strong-lookup?code=${encodeURIComponent(code)}`;
    supabase.auth.getSession().then(({ data: s }) => {
      const token = s.session?.access_token;
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      })
        .then(async (r) => {
          if (my !== reqId.current) return;
          const json = await r.json();
          if (!r.ok) throw new Error(json.error || "Erro");
          cache.set(code, json);
          setData(json);
        })
        .catch((e) => {
          if (my !== reqId.current) return;
          setError(e.message || "Erro ao buscar ocorrências");
        })
        .finally(() => {
          if (my !== reqId.current) return;
          setLoading(false);
        });
    });
  }, [code, enabled]);

  return { data, loading, error };
};
