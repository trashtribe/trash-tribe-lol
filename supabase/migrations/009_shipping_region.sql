-- Run this in Supabase → SQL Editor.
--
-- Adds a state/province field, required only for countries where Printify's
-- carriers need it (US, Canada, Australia) to route a shipment correctly.
-- Without this, re-enabling those countries at checkout would risk the same
-- "stuck on-hold, incomplete address" order as the address_to bug — Printify
-- would have first/last name, street, city, zip, but no region for a country
-- that requires one.

alter table public.orders
  add column if not exists shipping_region text;

alter table public.profiles
  add column if not exists shipping_region text;

comment on column public.orders.shipping_region is 'State/province — required for US, Canada, and Australia shipping addresses; optional/empty elsewhere.';
