-- Etapa 2: Purga automática de bible_chapter_cache expirado

-- Habilita extensões necessárias (idempotente)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Função de purga: remove linhas cujo expires_at já passou.
-- SECURITY DEFINER para permitir execução pelo scheduler sem RLS impedir.
create or replace function public.purge_expired_bible_cache()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.bible_chapter_cache
  where expires_at is not null
    and expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_bible_cache() from public, anon, authenticated;
grant execute on function public.purge_expired_bible_cache() to service_role;

-- Remove job antigo se existir (idempotente) e agenda novo a cada hora
do $$
begin
  perform cron.unschedule('purge-expired-bible-cache');
exception when others then
  null;
end;
$$;

select cron.schedule(
  'purge-expired-bible-cache',
  '17 * * * *', -- todo minuto 17 de cada hora
  $$select public.purge_expired_bible_cache();$$
);