CREATE TABLE public.strong_entries (
  strong_code TEXT PRIMARY KEY,
  language TEXT NOT NULL CHECK (language IN ('hebrew','greek','aramaic')),
  original TEXT NOT NULL,
  transliteration TEXT,
  pronunciation TEXT,
  short_definition TEXT,
  full_definition TEXT,
  part_of_speech TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.strong_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read strong_entries"
ON public.strong_entries FOR SELECT TO authenticated USING (true);

CREATE TABLE public.verse_word_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  word_index INTEGER NOT NULL,
  word_pt TEXT NOT NULL,
  strong_code TEXT REFERENCES public.strong_entries(strong_code) ON DELETE SET NULL,
  context_meaning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_slug, chapter, verse, word_index)
);

CREATE INDEX idx_verse_word_map_loc ON public.verse_word_map (book_slug, chapter, verse);
CREATE INDEX idx_verse_word_map_strong ON public.verse_word_map (strong_code);
CREATE INDEX idx_verse_word_map_word_pt ON public.verse_word_map (lower(word_pt));

ALTER TABLE public.verse_word_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read verse_word_map"
ON public.verse_word_map FOR SELECT TO authenticated USING (true);

CREATE TABLE public.word_study_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  word_pt TEXT NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_word_study_cache_unique
  ON public.word_study_cache (book_slug, chapter, verse, lower(word_pt));
CREATE INDEX idx_word_study_cache_loc ON public.word_study_cache (book_slug, chapter, verse);

ALTER TABLE public.word_study_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read word_study_cache"
ON public.word_study_cache FOR SELECT TO authenticated USING (true);