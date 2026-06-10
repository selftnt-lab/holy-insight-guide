CREATE TABLE public.bible_chapter_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translation TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (translation, book_slug, chapter)
);

CREATE INDEX idx_bible_chapter_cache_lookup
  ON public.bible_chapter_cache (translation, book_slug, chapter);

GRANT SELECT ON public.bible_chapter_cache TO anon, authenticated;
GRANT ALL ON public.bible_chapter_cache TO service_role;

ALTER TABLE public.bible_chapter_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bible cache"
  ON public.bible_chapter_cache
  FOR SELECT
  USING (true);

-- Tighten reading_plans visibility: AI-generated plans only visible to creator;
-- curated plans (created_by IS NULL) remain public.
DROP POLICY IF EXISTS "Anyone can view reading plans" ON public.reading_plans;
DROP POLICY IF EXISTS "Public read reading_plans" ON public.reading_plans;
DROP POLICY IF EXISTS "Read curated and own plans" ON public.reading_plans;

CREATE POLICY "Read curated and own plans"
  ON public.reading_plans
  FOR SELECT
  USING (
    COALESCE(ai_generated, false) = false
    OR created_by = auth.uid()
  );