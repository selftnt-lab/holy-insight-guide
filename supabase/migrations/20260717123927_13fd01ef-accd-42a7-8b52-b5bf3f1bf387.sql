-- Restrict KB tables to admin-only client access.
-- Regular users reach KB content exclusively through the SECURITY DEFINER
-- RPC public.match_kb_chunks (called by the chat edge function). Client-side
-- SELECT on kb_documents / kb_chunks / kb_ingest_jobs is not required for
-- normal users and was unnecessarily permissive.

-- kb_documents: remove blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated can read kb documents" ON public.kb_documents;

-- kb_chunks: remove blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated can read kb chunks" ON public.kb_chunks;

-- kb_ingest_jobs: add admin manage policy (writes still go through
-- service_role in the kb-ingest edge function; this policy just allows
-- admins to view/manage jobs from the admin UI end-to-end).
DROP POLICY IF EXISTS "Admins manage ingest jobs" ON public.kb_ingest_jobs;
CREATE POLICY "Admins manage ingest jobs"
  ON public.kb_ingest_jobs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));