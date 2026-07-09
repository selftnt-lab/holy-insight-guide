export interface ReadingParams {
  book?: string;
  chapter?: number;
  verse?: number;
}

/** Extract deep-link params for /reading from a URL query string. */
export const parseReadingParams = (
  search: string | URLSearchParams,
): ReadingParams => {
  const sp = typeof search === "string" ? new URLSearchParams(search) : search;
  const book = sp.get("book") || undefined;
  const chapterRaw = sp.get("chapter");
  const verseRaw = sp.get("verse");
  const chapter = chapterRaw ? parseInt(chapterRaw, 10) : undefined;
  const verse = verseRaw ? parseInt(verseRaw, 10) : undefined;
  return {
    book,
    chapter: chapter && chapter > 0 ? chapter : undefined,
    verse: verse && verse > 0 ? verse : undefined,
  };
};

export const hasReadingOverride = (p: ReadingParams) => Boolean(p.book);
