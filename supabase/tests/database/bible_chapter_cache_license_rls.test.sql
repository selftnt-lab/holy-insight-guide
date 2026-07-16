begin;
\i supabase/tests/database/_helpers.sql
select plan(6);

-- Seed one public_domain row (ACF) and one restricted row (NVI)
set local role postgres;
insert into public.bible_chapter_cache (translation, book_slug, chapter, payload, license_class)
values ('ACF', 'genesis', 1, '{"verses":[]}'::jsonb, 'public_domain')
on conflict (translation, book_slug, chapter) do update
  set payload = excluded.payload, license_class = excluded.license_class;

insert into public.bible_chapter_cache (translation, book_slug, chapter, payload, license_class)
values ('NVI', 'genesis', 1, '{"verses":[]}'::jsonb, 'restricted')
on conflict (translation, book_slug, chapter) do update
  set payload = excluded.payload, license_class = excluded.license_class;

-- Verify trigger populated expires_at only for restricted
select is(
  (select expires_at is not null from public.bible_chapter_cache where translation='NVI' and book_slug='genesis' and chapter=1),
  true, 'restricted row has expires_at set by trigger');

select is(
  (select expires_at is null from public.bible_chapter_cache where translation='ACF' and book_slug='genesis' and chapter=1),
  true, 'public_domain row has null expires_at');

-- anon: can see public_domain
select tests.authenticate_as_anon();
select is(
  (select count(*)::int from public.bible_chapter_cache where translation='ACF' and book_slug='genesis' and chapter=1),
  1, 'anon can SELECT public_domain rows');

-- anon: cannot see restricted
select is(
  (select count(*)::int from public.bible_chapter_cache where translation='NVI' and book_slug='genesis' and chapter=1),
  0, 'anon cannot SELECT restricted rows');

-- authenticated: sees both
select tests.create_user('reader@test.local') as u \gset
select tests.authenticate_as(:'u'::uuid);
select is(
  (select count(*)::int from public.bible_chapter_cache
    where book_slug='genesis' and chapter=1 and translation in ('ACF','NVI')),
  2, 'authenticated can SELECT both classes');

-- service_role: sees both
select tests.clear_authentication();
set local role service_role;
select is(
  (select count(*)::int from public.bible_chapter_cache
    where book_slug='genesis' and chapter=1 and translation in ('ACF','NVI')),
  2, 'service_role can SELECT both classes');

select * from finish();
rollback;
