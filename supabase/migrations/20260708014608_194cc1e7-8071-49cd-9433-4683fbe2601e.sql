
-- pgvector
create extension if not exists vector;

-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Knowledge base documents
create table public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.kb_documents to authenticated;
grant all on public.kb_documents to service_role;

alter table public.kb_documents enable row level security;

create policy "Authenticated can read kb documents"
on public.kb_documents for select to authenticated
using (true);

create policy "Admins manage kb documents"
on public.kb_documents for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger kb_documents_updated_at
before update on public.kb_documents
for each row execute function public.update_updated_at_column();

-- Chunks with embeddings (gemini-embedding-001 => 3072 dims)
create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(3072) not null,
  created_at timestamptz not null default now()
);

grant select on public.kb_chunks to authenticated;
grant all on public.kb_chunks to service_role;

alter table public.kb_chunks enable row level security;

create policy "Authenticated can read kb chunks"
on public.kb_chunks for select to authenticated
using (true);

create policy "Admins manage kb chunks"
on public.kb_chunks for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create index kb_chunks_document_id_idx on public.kb_chunks(document_id);
create index kb_chunks_embedding_hnsw
  on public.kb_chunks using hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);

-- Match function
create or replace function public.match_kb_chunks(
  query_embedding vector(3072),
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  title text,
  source text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.content,
    d.title,
    d.source,
    1 - (c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) as similarity
  from public.kb_chunks c
  join public.kb_documents d on d.id = c.document_id
  order by c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  limit match_count;
$$;
