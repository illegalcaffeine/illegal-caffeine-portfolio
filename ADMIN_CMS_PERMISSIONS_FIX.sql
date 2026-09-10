-- ILLEGAL CAFFEINE portfolio CMS permission fix
-- Run this once in Supabase Dashboard -> SQL Editor.
-- Needed for Supabase Data API access in projects where new public tables are not auto-granted.

-- Public site: read published rows only. RLS policy still decides which rows are visible.
grant select on table public.portfolio_projects to anon;

-- Signed-in admin: full CRUD through supabase-js. RLS policies still apply.
grant select, insert, update, delete on table public.portfolio_projects to authenticated;

-- Server-side maintenance, if used later.
grant select, insert, update, delete on table public.portfolio_projects to service_role;
