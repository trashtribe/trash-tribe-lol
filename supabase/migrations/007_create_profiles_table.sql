-- Run this in Supabase → SQL Editor, BEFORE 008_profiles_default_shipping_address.sql
-- (that one alters this table and will fail with "relation does not exist"
-- otherwise — which is exactly the error that surfaced this gap).
--
-- public.profiles was speced in 001_initial_schema.sql, but on the live
-- database it was never actually created — confirmed 4 jul 2026 when this
-- migration's ALTER TABLE failed with 42P01. orders and wishlist already
-- work in production, so they must reference auth.users directly rather
-- than public.profiles there. This migration only (re)creates profiles
-- itself; it does not touch orders/wishlist or their existing policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Keep new signups covered going forward.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
-- Use `execute procedure` instead of `execute function` if your project errors (older Postgres).
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: give every existing auth user a profiles row. Without this,
-- checkout address prefill/save and the account page would only work for
-- people who sign up from today onward.
insert into public.profiles (id, email, created_at)
select id, email, created_at
from auth.users
on conflict (id) do nothing;
