-- pgTAP: search_user_documents RPC — privileges + multi-user isolation

begin;
select plan(7);

-- Setup two users + docs + refs
select tests.clear_authentication();

do $$
declare
  ua uuid;
  ub uuid;
  da uuid;
  db uuid;
begin
  ua := tests.create_user('rpc_a@test.local');
  ub := tests.create_user('rpc_b@test.local');

  insert into public.user_documents (id, user_id, type, title, content_md, tags, is_archived)
  values
    (gen_random_uuid(), ua, 'sermon', 'Doc A1', 'sobre graça', array['grace'], false),
    (gen_random_uuid(), ua, 'note',   'Doc A2', 'nota',       array['study'], true)
  returning id into da;

  insert into public.user_documents (id, user_id, type, title, content_md, tags, is_archived)
  values (gen_random_uuid(), ub, 'sermon', 'Doc B1', 'do outro usuário', array['grace'], false)
  returning id into db;

  -- ref: João 3:16 do doc A1
  insert into public.user_document_refs (document_id, user_id, ref_raw, book_slug, chapter, verse_start, verse_end)
  select id, ua, 'João 3:16', 'joao', 3, 16, 16
  from public.user_documents where user_id = ua and title = 'Doc A1';

  -- ref sem verso (capítulo inteiro) para user B
  insert into public.user_document_refs (document_id, user_id, ref_raw, book_slug, chapter, verse_start, verse_end)
  select id, ub, 'João 3', 'joao', 3, null, null
  from public.user_documents where user_id = ub;

  perform set_config('tests.ua', ua::text, false);
  perform set_config('tests.ub', ub::text, false);
end $$;

-- 1) authenticated (user A) sees only own docs
select tests.authenticate_as((current_setting('tests.ua'))::uuid);

select is(
  (select count(*)::int from public.search_user_documents()),
  2,
  'user A sees own 2 documents'
);

select ok(
  not exists (
    select 1 from public.search_user_documents()
    where user_id <> (current_setting('tests.ua'))::uuid
  ),
  'user A never receives docs from other users'
);

-- 2) filter by ref João 3:16 finds A1
select is(
  (select count(*)::int from public.search_user_documents(
    p_book_slug := 'joao', p_chapter := 3, p_verse := 16
  )),
  1,
  'user A: ref filter (João 3:16) finds Doc A1'
);

-- 3) verse without chapter => empty
select is(
  (select count(*)::int from public.search_user_documents(
    p_book_slug := 'joao', p_verse := 16
  )),
  0,
  'verse without chapter returns no rows'
);

-- 4) user B sees only own doc (chapter-wide ref matches any verse in ch3)
select tests.clear_authentication();
select tests.authenticate_as((current_setting('tests.ub'))::uuid);

select is(
  (select count(*)::int from public.search_user_documents(
    p_book_slug := 'joao', p_chapter := 3, p_verse := 5
  )),
  1,
  'user B: chapter-wide ref matches any verse in chapter'
);

select ok(
  not exists (
    select 1 from public.search_user_documents()
    where user_id <> (current_setting('tests.ub'))::uuid
  ),
  'user B never receives docs from other users'
);

-- 5) anon cannot execute the RPC
select tests.clear_authentication();
select tests.authenticate_as_anon();

select throws_ok(
  $q$ select * from public.search_user_documents() $q$,
  '42501',
  null,
  'anon is denied EXECUTE on search_user_documents'
);

select tests.clear_authentication();
select * from finish();
rollback;
