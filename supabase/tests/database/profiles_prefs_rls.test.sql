begin;
\i supabase/tests/database/_helpers.sql
select plan(6);

-- Seed two users (auth.users) + profiles are auto-created by handle_new_user trigger.
-- If the trigger is not attached in the local shadow DB, we insert manually.
select tests.create_user('a@test.local') as a \gset
select tests.create_user('b@test.local') as b \gset

insert into public.profiles (user_id, display_name, preferred_translation)
values (:'a'::uuid, 'A', 'ACF'), (:'b'::uuid, 'B', 'ACF')
on conflict (user_id) do nothing;

-- A can read own profile
select tests.authenticate_as(:'a'::uuid);
select is(
  (select count(*)::int from public.profiles where user_id = :'a'::uuid),
  1, 'A reads own profile');

-- A cannot read B
select is(
  (select count(*)::int from public.profiles where user_id = :'b'::uuid),
  0, 'A cannot read B profile');

-- A can update own preferred_translation
update public.profiles set preferred_translation = 'NAA' where user_id = :'a'::uuid;
select is(
  (select preferred_translation from public.profiles where user_id = :'a'::uuid),
  'NAA', 'A updates own preferred_translation');

-- A cannot update B's profile (0 rows affected)
with u as (
  update public.profiles set preferred_translation = 'NVI' where user_id = :'b'::uuid returning 1
)
select is((select count(*)::int from u), 0, 'A cannot update B profile');

-- B sees own row untouched
select tests.authenticate_as(:'b'::uuid);
select is(
  (select preferred_translation from public.profiles where user_id = :'b'::uuid),
  'ACF', 'B profile untouched by A');

-- Anon cannot select
select tests.authenticate_as_anon();
select is(
  (select count(*)::int from public.profiles),
  0, 'anon cannot select profiles');

select * from finish();
rollback;
