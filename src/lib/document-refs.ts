import { supabase } from "@/integrations/supabase/client";
import { findBibleReferences } from "@/lib/bible-reference-scan";
import { BIBLE_BOOKS } from "@/lib/bible-books";

export interface DocumentRef {
  id?: string;
  document_id: string;
  user_id: string;
  ref_raw: string;
  book_slug: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
}

const BOOK_ORDER = new Map(BIBLE_BOOKS.map((b, i) => [b.slug, i]));

export const bookOrderIndex = (slug: string) =>
  BOOK_ORDER.get(slug) ?? Number.MAX_SAFE_INTEGER;

/** Extract deduped normalized refs from markdown content. */
export const extractRefsFromContent = (
  content: string,
): Omit<DocumentRef, "document_id" | "user_id">[] => {
  const matches = findBibleReferences(content);
  const seen = new Map<string, Omit<DocumentRef, "document_id" | "user_id">>();
  for (const m of matches) {
    const { book, chapter, verseStart, verseEnd } = m.parsed;
    const vs = verseStart ?? null;
    const ve = verseEnd ?? null;
    const key = `${book.slug}|${chapter}|${vs ?? ""}|${ve ?? ""}`;
    if (seen.has(key)) continue;
    const canonical = vs
      ? `${book.name} ${chapter}:${vs}${ve && ve !== vs ? `-${ve}` : ""}`
      : `${book.name} ${chapter}`;
    seen.set(key, {
      ref_raw: canonical,
      book_slug: book.slug,
      chapter,
      verse_start: vs,
      verse_end: ve,
    });
  }
  return Array.from(seen.values());
};

/** Replace all refs for a given document with the ones present in content. */
export const syncDocumentRefs = async (
  documentId: string,
  userId: string,
  content: string,
) => {
  const refs = extractRefsFromContent(content);

  const { error: delErr } = await supabase
    .from("user_document_refs")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId);
  if (delErr) throw delErr;

  if (refs.length === 0) return [];

  const rows = refs.map((r) => ({
    ...r,
    document_id: documentId,
    user_id: userId,
  }));
  const { error: insErr } = await supabase.from("user_document_refs").insert(rows);
  if (insErr) throw insErr;
  return rows;
};
