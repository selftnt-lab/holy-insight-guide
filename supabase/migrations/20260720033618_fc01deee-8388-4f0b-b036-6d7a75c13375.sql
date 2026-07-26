
-- Fix 1: client_error_logs — enforce user_id must be null or match auth.uid()
DROP POLICY IF EXISTS "anyone can insert error logs" ON public.client_error_logs;
CREATE POLICY "anyone can insert error logs"
ON public.client_error_logs
FOR INSERT
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND message IS NOT NULL
  AND length(message) BETWEEN 1 AND 2000
  AND (route IS NULL OR length(route) <= 500)
  AND (stack IS NULL OR length(stack) <= 8000)
  AND (user_agent IS NULL OR length(user_agent) <= 1000)
  AND (build IS NULL OR length(build) <= 200)
);

-- Fix 2: user_document_refs — ensure document_id belongs to the same user
DROP POLICY IF EXISTS "Users insert own document refs" ON public.user_document_refs;
CREATE POLICY "Users insert own document refs"
ON public.user_document_refs
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_documents d
    WHERE d.id = user_document_refs.document_id
      AND d.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users update own document refs" ON public.user_document_refs;
CREATE POLICY "Users update own document refs"
ON public.user_document_refs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_documents d
    WHERE d.id = user_document_refs.document_id
      AND d.user_id = auth.uid()
  )
);
