
CREATE TABLE public.user_document_refs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  ref_raw TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  chapter INT NOT NULL,
  verse_start INT NULL,
  verse_end INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_document_refs_user_doc ON public.user_document_refs(user_id, document_id);
CREATE INDEX idx_user_document_refs_user_book_chapter ON public.user_document_refs(user_id, book_slug, chapter);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_document_refs TO authenticated;
GRANT ALL ON public.user_document_refs TO service_role;

ALTER TABLE public.user_document_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own document refs" ON public.user_document_refs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own document refs" ON public.user_document_refs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own document refs" ON public.user_document_refs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own document refs" ON public.user_document_refs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
