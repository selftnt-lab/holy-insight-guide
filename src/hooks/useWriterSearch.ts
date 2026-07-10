import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserDocument } from "@/hooks/useUserDocuments";

export type WriterSearchArchived = "active" | "archived" | "all";

export interface WriterSearchFilters {
  query: string;
  archived: WriterSearchArchived;
  tag: string;
  bookSlug: string;
  chapter: number | null;
  verse: number | null;
}

export const emptyWriterFilters: WriterSearchFilters = {
  query: "",
  archived: "active",
  tag: "",
  bookSlug: "",
  chapter: null,
  verse: null,
};

const useDebounced = <T,>(value: T, ms = 350): T => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

export interface WriterSearchResult extends UserDocument {
  total_count: number;
}

export const useWriterSearch = (filters: WriterSearchFilters, limit = 50, offset = 0) => {
  const { user } = useAuth();
  const debounced = useDebounced(filters, 350);

  return useQuery({
    queryKey: ["writer_search", user?.id, debounced, limit, offset],
    enabled: !!user,
    queryFn: async () => {
      const p_archived =
        debounced.archived === "all" ? null : debounced.archived === "archived";
      const { data, error } = await (supabase.rpc as any)("search_user_documents", {
        p_query: debounced.query.trim() || null,
        p_archived,
        p_tag: debounced.tag.trim() || null,
        p_book_slug: debounced.bookSlug || null,
        p_chapter: debounced.chapter,
        p_verse: debounced.verse,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      const rows = (data ?? []) as WriterSearchResult[];
      return {
        rows,
        total: rows[0]?.total_count ?? 0,
      };
    },
  });
};
