
ALTER TABLE public.reading_progress
  ADD COLUMN IF NOT EXISTS streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_read_date date;

CREATE TABLE IF NOT EXISTS public.reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  duration_days integer NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  days jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reading_plans TO anon, authenticated;
GRANT ALL ON public.reading_plans TO service_role;
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reading plans are readable by everyone"
  ON public.reading_plans FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.user_plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  current_day integer NOT NULL DEFAULT 1,
  completed_days integer[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plan_progress TO authenticated;
GRANT ALL ON public.user_plan_progress TO service_role;
ALTER TABLE public.user_plan_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own plan progress"
  ON public.user_plan_progress FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plan progress"
  ON public.user_plan_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plan progress"
  ON public.user_plan_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own plan progress"
  ON public.user_plan_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_plan_progress_updated_at
  BEFORE UPDATE ON public.user_plan_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
