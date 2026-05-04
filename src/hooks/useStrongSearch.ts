import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StrongEntry, StrongOccurrence } from "./useStrongDetail";

export interface StrongSearchGroup {
  strong_code: string;
  count: number;
  samples: StrongOccurrence[];
  entry: StrongEntry | null;
}

export interface StrongSearchResult {
  query: string;
  results: StrongSearchGroup[];
  total: number;
}

const cache = new Map<string, StrongSearchResult>();

export const useStrongSearch = (query: string | null, enabled: boolean) => {
  const [data, setData] = useState<StrongSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || !query || !query.trim()) {
      setData(null);
      return;
    }
    const term = query.trim().toLowerCase();
    const cached = cache.get(term);
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

    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/strong-lookup?q=${encodeURIComponent(term)}`;
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
          cache.set(term, json);
          setData(json);
        })
        .catch((e) => {
          if (my !== reqId.current) return;
          setError(e.message || "Erro ao buscar");
        })
        .finally(() => {
          if (my !== reqId.current) return;
          setLoading(false);
        });
    });
  }, [query, enabled]);

  return { data, loading, error };
};
