
CREATE TABLE public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sermon','devotional','study','note')),
  title text NOT NULL DEFAULT '',
  content_md text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_documents TO authenticated;
GRANT ALL ON public.user_documents TO service_role;

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own documents" ON public.user_documents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own documents" ON public.user_documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own documents" ON public.user_documents
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own documents" ON public.user_documents
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_user_documents_user_updated ON public.user_documents (user_id, updated_at DESC);
CREATE INDEX idx_user_documents_tags ON public.user_documents USING GIN (tags);

CREATE TRIGGER trg_user_documents_updated_at
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
