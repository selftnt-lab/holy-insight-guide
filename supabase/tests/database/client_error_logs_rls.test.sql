begin;
\i supabase/tests/database/_helpers.sql
select plan(5);

select tests.create_user('user-logs@test.local') as u \gset
select tests.create_user('admin-logs@test.local') as adm \gset
select tests.grant_admin(:'adm'::uuid);

-- anon can insert
select tests.authenticate_as_anon();
insert into public.client_error_logs (message, route) values ('anon boom', '/x');
select is(
  (select count(*)::int from public.client_error_logs where message = 'anon boom'),
  0, 'anon cannot select even own inserted rows');

-- authenticated user can insert
select tests.authenticate_as(:'u'::uuid);
insert into public.client_error_logs (message, route, user_id) values ('user boom', '/y', :'u'::uuid);
select is(
  (select count(*)::int from public.client_error_logs),
  0, 'regular user cannot select error logs');

-- regular user cannot delete
with d as (delete from public.client_error_logs returning 1)
select is((select count(*)::int from d), 0, 'regular user cannot delete logs');

-- admin can select
select tests.authenticate_as(:'adm'::uuid);
select cmp_ok(
  (select count(*)::int from public.client_error_logs),
  '>=', 2, 'admin sees logs (>=2 inserted)');

-- admin can delete
with d as (delete from public.client_error_logs returning 1)
select cmp_ok((select count(*)::int from d), '>=', 2, 'admin can delete logs');

select * from finish();
rollback;
