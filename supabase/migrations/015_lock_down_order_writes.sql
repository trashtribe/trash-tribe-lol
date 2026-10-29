-- Run this in Supabase → SQL Editor.
--
-- Migration 001 let a signed-in user insert/update their own orders and
-- insert/delete their own order_items straight from the browser with the
-- public anon key ("tighten later for production"). That allowed getting
-- products for free: start checkout for one €20 tee, add more order_items
-- to that pending order from the browser console, pay the €20 — and the
-- Stripe webhook sends every row in order_items to Printify. The same
-- access could also change status or shipping address on a paid order.
--
-- The app never writes these tables from the browser: create-payment-intent,
-- the Stripe webhook and Printify fulfillment all use the service-role key,
-- which bypasses RLS. Browsers only read their own orders (account page),
-- so the select policies stay and every write policy goes.

drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "orders_update_own" on public.orders;
drop policy if exists "order_items_insert_own" on public.order_items;
drop policy if exists "order_items_delete_own" on public.order_items;

-- The live database didn't use 001's policy names: these were created by
-- hand in the dashboard and do the same thing (found via pg_policies).
drop policy if exists "users can insert own orders" on public.orders;
drop policy if exists "users can insert order items" on public.order_items;

-- Make sure RLS is still on (no policy = no access for anon/authenticated).
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
