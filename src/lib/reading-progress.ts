const KEY = "bible-reading-progress-v1";

export interface ReadingProgress {
  bookSlug: string;
  chapter: number;
  updatedAt: number;
  chaptersRead: string[]; // "slug:chapter"
}

const DEFAULT: ReadingProgress = {
  bookSlug: "genesis",
  chapter: 1,
  updatedAt: Date.now(),
  chaptersRead: [],
};

export const getProgress = (): ReadingProgress => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
};

export const saveProgress = (bookSlug: string, chapter: number) => {
  const current = getProgress();
  const tag = `${bookSlug}:${chapter}`;
  const chaptersRead = current.chaptersRead.includes(tag)
    ? current.chaptersRead
    : [...current.chaptersRead, tag];
  const next: ReadingProgress = {
    bookSlug,
    chapter,
    updatedAt: Date.now(),
    chaptersRead,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};
