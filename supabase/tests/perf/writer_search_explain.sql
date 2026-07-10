-- ETAPA 15 — Perf checks for search_user_documents
--
-- Como rodar localmente (Supabase CLI + Docker):
--   supabase start
--   psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" -f supabase/tests/perf/writer_search_explain.sql
--
-- Alvos indicativos com ~1k docs / ~5k refs:
--   - texto puro: < 50ms
--   - book+chapter: < 30ms (index scan em user_document_refs)
--   - book+chapter+verse: < 30ms

-- Ajuste um user_id real de dev antes de rodar:
-- select set_config('request.jwt.claims', json_build_object('sub','<UUID>','role','authenticated')::text, true);
-- set role authenticated;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.search_user_documents(p_query := 'graça');

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.search_user_documents(p_book_slug := 'joao', p_chapter := 3);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.search_user_documents(p_book_slug := 'joao', p_chapter := 3, p_verse := 16);
