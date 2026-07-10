-- Helpers for pgTAP RLS tests.
-- Usage: select tests.authenticate_as('<uuid>');   select tests.clear_authentication();

create schema if not exists tests;

create or replace function tests.create_user(email text)
returns uuid language plpgsql as $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email, '', now(), now(), now());
  return uid;
end $$;

create or replace function tests.authenticate_as(user_id uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', user_id::text, 'role', 'authenticated')::text, true);
end $$;

create or replace function tests.authenticate_as_anon()
returns void language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end $$;

create or replace function tests.clear_authentication()
returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end $$;

create or replace function tests.grant_admin(user_id uuid)
returns void language sql as $$
  insert into public.user_roles (user_id, role) values (user_id, 'admin')
  on conflict do nothing;
$$;
