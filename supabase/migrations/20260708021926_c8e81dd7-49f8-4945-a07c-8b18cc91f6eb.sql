CREATE TABLE public.kb_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  similarity_threshold REAL NOT NULL DEFAULT 0.35 CHECK (similarity_threshold >= 0 AND similarity_threshold <= 1),
  match_count INTEGER NOT NULL DEFAULT 5 CHECK (match_count >= 1 AND match_count <= 20),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.kb_settings TO authenticated;
GRANT ALL ON public.kb_settings TO service_role;

ALTER TABLE public.kb_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read kb_settings" ON public.kb_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upsert kb_settings" ON public.kb_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update kb_settings" ON public.kb_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER kb_settings_updated_at
  BEFORE UPDATE ON public.kb_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.kb_settings (id) VALUES (true) ON CONFLICT DO NOTHING;