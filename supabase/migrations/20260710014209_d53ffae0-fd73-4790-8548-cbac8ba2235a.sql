
-- ETAPA 15: hardening + performance for search_user_documents

-- 1) Recreate function with defensive input validation (SECURITY INVOKER via SQL default; keep STABLE)
CREATE OR REPLACE FUNCTION public.search_user_documents(
  p_query text DEFAULT NULL,
  p_archived boolean DEFAULT NULL,
  p_tag text DEFAULT NULL,
  p_book_slug text DEFAULT NULL,
  p_chapter integer DEFAULT NULL,
  p_verse integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid, user_id uuid, type text, title text, content_md text, tags text[],
  is_archived boolean, created_at timestamptz, updated_at timestamptz, total_count bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  WITH cfg AS (
    SELECT
      auth.uid() AS uid,
      LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off,
      NULLIF(btrim(LEFT(COALESCE(p_query, ''), 200)), '') AS q,
      NULLIF(btrim(COALESCE(p_tag, '')), '') AS tg,
      NULLIF(btrim(COALESCE(p_book_slug, '')), '') AS bslug,
      CASE WHEN p_chapter IS NOT NULL AND p_chapter >= 1 THEN p_chapter END AS ch,
      CASE WHEN p_verse IS NOT NULL AND p_verse >= 1 THEN p_verse END AS vs
  ),
  base AS (
    SELECT d.*
    FROM public.user_documents d, cfg
    WHERE d.user_id = cfg.uid
      AND cfg.uid IS NOT NULL
      -- verse without chapter => no results
      AND NOT (cfg.vs IS NOT NULL AND cfg.ch IS NULL)
      AND (p_archived IS NULL OR d.is_archived = p_archived)
      AND (
        cfg.q IS NULL
        OR d.title ILIKE '%' || cfg.q || '%'
        OR EXISTS (SELECT 1 FROM unnest(d.tags) t WHERE t ILIKE '%' || cfg.q || '%')
        OR d.content_md ILIKE '%' || cfg.q || '%'
      )
      AND (cfg.tg IS NULL OR cfg.tg = ANY(d.tags))
      AND (
        cfg.bslug IS NULL
        OR EXISTS (
          SELECT 1 FROM public.user_document_refs r
          WHERE r.document_id = d.id
            AND r.user_id = cfg.uid
            AND r.book_slug = cfg.bslug
            AND (cfg.ch IS NULL OR r.chapter = cfg.ch)
            AND (
              cfg.vs IS NULL
              OR r.verse_start IS NULL
              OR (r.verse_start <= cfg.vs AND (r.verse_end IS NULL OR r.verse_end >= cfg.vs))
            )
        )
      )
  ),
  counted AS (SELECT count(*) AS c FROM base)
  SELECT b.id, b.user_id, b.type::text, b.title, b.content_md, b.tags,
         b.is_archived, b.created_at, b.updated_at,
         (SELECT c FROM counted) AS total_count
  FROM base b
  ORDER BY b.updated_at DESC
  LIMIT (SELECT lim FROM cfg)
  OFFSET (SELECT off FROM cfg);
$$;

-- 2) EXECUTE privileges: only authenticated + service_role
REVOKE ALL ON FUNCTION public.search_user_documents(text, boolean, text, text, integer, integer, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_user_documents(text, boolean, text, text, integer, integer, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_user_documents(text, boolean, text, text, integer, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_user_documents(text, boolean, text, text, integer, integer, integer, integer) TO service_role;

-- 3) Indexes aligned with RPC WHERE/ORDER
CREATE INDEX IF NOT EXISTS idx_user_documents_user_archived_updated
  ON public.user_documents (user_id, is_archived, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_updated
  ON public.user_documents (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_documents_tags_gin
  ON public.user_documents USING gin (tags);

CREATE INDEX IF NOT EXISTS idx_user_document_refs_doc
  ON public.user_document_refs (document_id);

CREATE INDEX IF NOT EXISTS idx_user_document_refs_user_book_chapter
  ON public.user_document_refs (user_id, book_slug, chapter);
