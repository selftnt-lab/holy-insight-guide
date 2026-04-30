CREATE TABLE public.explore_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_slug TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  cards JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (book_slug, chapter)
);

ALTER TABLE public.explore_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read suggestions"
  ON public.explore_suggestions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_explore_suggestions_book_chapter
  ON public.explore_suggestions (book_slug, chapter);