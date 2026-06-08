
CREATE POLICY "Users insert own AI plans" ON public.reading_plans
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND ai_generated = true);

CREATE POLICY "Users update own AI plans" ON public.reading_plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by AND ai_generated = true)
  WITH CHECK (auth.uid() = created_by AND ai_generated = true);

CREATE POLICY "Users delete own AI plans" ON public.reading_plans
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by AND ai_generated = true);
