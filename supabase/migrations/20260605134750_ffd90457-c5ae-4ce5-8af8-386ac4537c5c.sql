
ALTER TABLE public.reading_plans DROP COLUMN IF EXISTS days;
ALTER TABLE public.reading_plans ADD COLUMN IF NOT EXISTS books_filter text NOT NULL DEFAULT 'all';
