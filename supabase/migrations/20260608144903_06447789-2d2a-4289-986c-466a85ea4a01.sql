
-- chapter_studies: cache de estudo de capítulo gerado por IA
CREATE TABLE public.chapter_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug text NOT NULL,
  chapter int NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_slug, chapter)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_studies TO authenticated;
GRANT ALL ON public.chapter_studies TO service_role;
ALTER TABLE public.chapter_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chapter_studies" ON public.chapter_studies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_chapter_studies_updated BEFORE UPDATE ON public.chapter_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- reflection_answers: respostas pessoais às perguntas reflexivas
CREATE TABLE public.reflection_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug text NOT NULL,
  chapter int NOT NULL,
  question_index int NOT NULL,
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_slug, chapter, question_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflection_answers TO authenticated;
GRANT ALL ON public.reflection_answers TO service_role;
ALTER TABLE public.reflection_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflection_answers" ON public.reflection_answers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_reflection_answers_updated BEFORE UPDATE ON public.reflection_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- daily_devotionals: devocional diário personalizado
CREATE TABLE public.daily_devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  verse_ref text NOT NULL,
  content jsonb NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_devotionals TO authenticated;
GRANT ALL ON public.daily_devotionals TO service_role;
ALTER TABLE public.daily_devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily_devotionals" ON public.daily_devotionals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reading_plans: marcador de plano gerado por IA
ALTER TABLE public.reading_plans ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false;
ALTER TABLE public.reading_plans ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
