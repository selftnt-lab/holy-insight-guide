
CREATE TABLE public.verse_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  color text NOT NULL DEFAULT 'yellow',
  note text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_slug, chapter, verse)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.verse_highlights TO authenticated;
GRANT ALL ON public.verse_highlights TO service_role;

ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own highlights" ON public.verse_highlights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own highlights" ON public.verse_highlights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own highlights" ON public.verse_highlights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own highlights" ON public.verse_highlights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_verse_highlights_updated_at
  BEFORE UPDATE ON public.verse_highlights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_verse_highlights_user_book_chapter
  ON public.verse_highlights (user_id, book_slug, chapter);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_translations text[] NOT NULL DEFAULT ARRAY['almeida','kjv']::text[];
