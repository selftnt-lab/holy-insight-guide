import { supabase } from "@/integrations/supabase/client";

export interface ReadingProgress {
  bookSlug: string;
  chapter: number;
  chaptersRead: string[]; // "slug:chapter"
}

const DEFAULT: ReadingProgress = {
  bookSlug: "genesis",
  chapter: 1,
  chaptersRead: [],
};

export const fetchProgress = async (userId: string): Promise<ReadingProgress> => {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("book_slug, chapter, chapters_read")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT;
  return {
    bookSlug: data.book_slug,
    chapter: data.chapter,
    chaptersRead: data.chapters_read ?? [],
  };
};

export const saveProgress = async (
  userId: string,
  bookSlug: string,
  chapter: number
): Promise<ReadingProgress> => {
  const current = await fetchProgress(userId);
  const tag = `${bookSlug}:${chapter}`;
  const chaptersRead = current.chaptersRead.includes(tag)
    ? current.chaptersRead
    : [...current.chaptersRead, tag];

  const { error } = await supabase
    .from("reading_progress")
    .update({
      book_slug: bookSlug,
      chapter,
      chapters_read: chaptersRead,
    })
    .eq("user_id", userId);

  if (error) console.error("saveProgress error", error);

  return { bookSlug, chapter, chaptersRead };
};
