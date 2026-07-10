begin;
\i supabase/tests/database/_helpers.sql
select plan(3);

select tests.create_user('a-refs@test.local') as a \gset
select tests.create_user('b-refs@test.local') as b \gset

select tests.authenticate_as(:'a'::uuid);
insert into public.user_documents (user_id, type, title) values (:'a'::uuid, 'note', 'A')
  returning id as doc_a \gset
insert into public.user_document_refs (document_id, user_id, ref_raw, book_slug, chapter, verse_start, verse_end)
values (:'doc_a'::uuid, :'a'::uuid, 'João 3:16', 'joao', 3, 16, 16);

select is(
  (select count(*)::int from public.user_document_refs where document_id = :'doc_a'::uuid),
  1, 'A sees own refs');

-- B cannot see A's refs
select tests.authenticate_as(:'b'::uuid);
select is(
  (select count(*)::int from public.user_document_refs where document_id = :'doc_a'::uuid),
  0, 'B cannot see A refs');

-- B cannot insert ref for A's doc (with_check user_id = auth.uid())
prepare bad_ref as insert into public.user_document_refs
  (document_id, user_id, ref_raw, book_slug, chapter, verse_start, verse_end)
  values ($1, $2, 'x', 'joao', 1, 1, 1);
select throws_ok(
  format('execute bad_ref(%L, %L)', :'doc_a'::uuid, :'a'::uuid),
  NULL, NULL, 'B cannot insert ref masquerading as A');

select * from finish();
rollback;
