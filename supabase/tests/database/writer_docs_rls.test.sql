begin;
\i supabase/tests/database/_helpers.sql
select plan(6);

select tests.create_user('a-docs@test.local') as a \gset
select tests.create_user('b-docs@test.local') as b \gset

-- A creates own doc
select tests.authenticate_as(:'a'::uuid);
insert into public.user_documents (user_id, type, title, content_md)
values (:'a'::uuid, 'note', 'Doc A', 'hello') returning id as doc_a \gset

select is(
  (select count(*)::int from public.user_documents where id = :'doc_a'::uuid),
  1, 'A reads own doc');

-- A updates own doc
update public.user_documents set title = 'Doc A2' where id = :'doc_a'::uuid;
select is(
  (select title from public.user_documents where id = :'doc_a'::uuid),
  'Doc A2', 'A updates own doc');

-- A cannot insert doc pretending to be B
prepare bad_insert as insert into public.user_documents (user_id, type, title) values ($1, 'note', 'x');
select throws_ok(
  format('execute bad_insert(%L)', :'b'::uuid),
  NULL, NULL, 'A cannot insert doc for B (RLS with_check)');

-- B cannot see A's doc
select tests.authenticate_as(:'b'::uuid);
select is(
  (select count(*)::int from public.user_documents where id = :'doc_a'::uuid),
  0, 'B cannot read A doc');

-- B cannot update A's doc
with u as (
  update public.user_documents set title = 'hacked' where id = :'doc_a'::uuid returning 1
)
select is((select count(*)::int from u), 0, 'B cannot update A doc');

-- B cannot delete A's doc
with d as (
  delete from public.user_documents where id = :'doc_a'::uuid returning 1
)
select is((select count(*)::int from d), 0, 'B cannot delete A doc');

select * from finish();
rollback;
