-- ILLEGAL CAFFEINE site-wide CMS extension
-- Run this once in Supabase Dashboard -> SQL Editor after ADMIN_CMS_SETUP.sql.

create table if not exists public.site_content (
  key text primary key check (key in ('homepage','faq','payment','contact','site')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant select on table public.site_content to anon;
grant select, insert, update, delete on table public.site_content to authenticated;
grant select, insert, update, delete on table public.site_content to service_role;

drop policy if exists "site content public read" on public.site_content;
create policy "site content public read"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "site content admin insert" on public.site_content;
create policy "site content admin insert"
on public.site_content
for insert
to authenticated
with check (true);

drop policy if exists "site content admin update" on public.site_content;
create policy "site content admin update"
on public.site_content
for update
to authenticated
using (true)
with check (true);

drop policy if exists "site content admin delete" on public.site_content;
create policy "site content admin delete"
on public.site_content
for delete
to authenticated
using (true);

create or replace function public.set_site_content_updated_at()
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

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
before update on public.site_content
for each row execute function public.set_site_content_updated_at();
