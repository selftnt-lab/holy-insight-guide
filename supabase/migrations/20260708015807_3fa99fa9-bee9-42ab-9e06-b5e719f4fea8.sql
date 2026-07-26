
create table public.kb_ingest_jobs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.kb_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  progress int not null default 0,
  total_chunks int not null default 0,
  processed_chunks int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.kb_ingest_jobs to authenticated;
grant all on public.kb_ingest_jobs to service_role;

alter table public.kb_ingest_jobs enable row level security;

create policy "Admins read jobs"
on public.kb_ingest_jobs for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create trigger kb_ingest_jobs_updated_at
before update on public.kb_ingest_jobs
for each row execute function public.update_updated_at_column();
