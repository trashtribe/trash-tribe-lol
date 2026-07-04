-- Run this in Supabase → SQL Editor.
--
-- Lets logged-in users skip re-typing their shipping address at checkout:
-- we save it to their profile after a successful order and prefill the
-- checkout form with it next time.

alter table public.profiles
  add column if not exists shipping_name text,
  add column if not exists shipping_address1 text,
  add column if not exists shipping_address2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text,
  add column if not exists shipping_phone text;

comment on column public.profiles.shipping_name is 'Default shipping name, saved from the most recent checkout for prefill.';
