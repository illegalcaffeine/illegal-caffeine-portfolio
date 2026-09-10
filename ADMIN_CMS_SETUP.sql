-- ILLEGAL CAFFEINE portfolio admin CMS
-- Run this once in Supabase Dashboard -> SQL Editor.
-- Then create ONE Auth user in Authentication -> Users and keep public sign-up disabled.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_en text,
  category_ko text,
  filter text not null default 'fantasy' check (filter in ('spawns','cities','fantasy','terrain','commissions')),
  description_en text[] not null default '{}',
  description_ko text[] not null default '{}',
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,
  award_en text,
  award_ko text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;

-- Public site may read published projects only.
drop policy if exists "portfolio published read" on public.portfolio_projects;
create policy "portfolio published read"
on public.portfolio_projects
for select
to anon, authenticated
using (published = true or auth.role() = 'authenticated');

-- Admin writes require a signed-in Supabase Auth user.
drop policy if exists "portfolio admin insert" on public.portfolio_projects;
create policy "portfolio admin insert"
on public.portfolio_projects
for insert
to authenticated
with check (true);

drop policy if exists "portfolio admin update" on public.portfolio_projects;
create policy "portfolio admin update"
on public.portfolio_projects
for update
to authenticated
using (true)
with check (true);

drop policy if exists "portfolio admin delete" on public.portfolio_projects;
create policy "portfolio admin delete"
on public.portfolio_projects
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  15728640,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public images.
drop policy if exists "portfolio media public read" on storage.objects;
create policy "portfolio media public read"
on storage.objects
for select
to public
using (bucket_id = 'portfolio-media');

-- Only authenticated admin sessions can modify portfolio images.
drop policy if exists "portfolio media admin insert" on storage.objects;
create policy "portfolio media admin insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio-media');

drop policy if exists "portfolio media admin update" on storage.objects;
create policy "portfolio media admin update"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-media')
with check (bucket_id = 'portfolio-media');

drop policy if exists "portfolio media admin delete" on storage.objects;
create policy "portfolio media admin delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-media');

create or replace function public.set_portfolio_project_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_updated_at on public.portfolio_projects;
create trigger portfolio_projects_updated_at
before update on public.portfolio_projects
for each row execute function public.set_portfolio_project_updated_at();
