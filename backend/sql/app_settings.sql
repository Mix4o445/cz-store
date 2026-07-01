-- Single-row table for global site settings.
-- Run this in the Supabase SQL editor to create the table.
-- Safe to re-run: IF NOT EXISTS / OR REPLACE on the policy.

create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  maintenance_mode boolean not null default false,
  maintenance_message text default 'Site en maintenance. Nous revenons bientôt.',
  updated_at timestamptz not null default now()
);

-- Make sure the singleton row exists.
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- Public read is fine (the GET endpoint is unauthenticated).
alter table public.app_settings enable row level security;

drop policy if exists "app_settings public read" on public.app_settings;
create policy "app_settings public read"
  on public.app_settings
  for select
  using (true);

-- Only the service role (used by the Express backend) can write. No policy
-- needed for the public role to write because the backend uses the service
-- role key which bypasses RLS.
