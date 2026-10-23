-- Run in your Supabase SQL editor. The public browser client has no table access.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  email_hash text not null,
  language text not null check (language in ('en', 'ka')),
  consent_version text not null,
  source text not null default 'landing-page',
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
grant select, insert on public.waitlist to service_role;
