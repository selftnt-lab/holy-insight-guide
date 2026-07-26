
CREATE OR REPLACE FUNCTION public.search_user_documents(
  p_query text DEFAULT NULL,
  p_archived boolean DEFAULT NULL,
  p_tag text DEFAULT NULL,
  p_book_slug text DEFAULT NULL,
  p_chapter int DEFAULT NULL,
  p_verse int DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type text,
  title text,
  content_md text,
  tags text[],
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH base AS (
    SELECT d.*
    FROM public.user_documents d
    WHERE d.user_id = auth.uid()
      AND (p_archived IS NULL OR d.is_archived = p_archived)
      AND (
        p_query IS NULL OR btrim(p_query) = ''
        OR d.title ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(d.tags) t
          WHERE t ILIKE '%' || p_query || '%'
        )
        OR d.content_md ILIKE '%' || p_query || '%'
      )
      AND (
        p_tag IS NULL OR btrim(p_tag) = ''
        OR p_tag = ANY(d.tags)
      )
      AND (
        p_book_slug IS NULL OR btrim(p_book_slug) = ''
        OR EXISTS (
          SELECT 1 FROM public.user_document_refs r
          WHERE r.document_id = d.id
            AND r.user_id = auth.uid()
            AND r.book_slug = p_book_slug
            AND (p_chapter IS NULL OR r.chapter = p_chapter)
            AND (
              p_verse IS NULL
              OR r.verse_start IS NULL
              OR (r.verse_start <= p_verse AND (r.verse_end IS NULL OR r.verse_end >= p_verse))
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
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.search_user_documents(text, boolean, text, text, int, int, int, int) TO authenticated;
