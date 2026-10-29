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
-- Despite its name, this one is an INSERT policy, not a read policy.
drop policy if exists "users can view own orders" on public.orders;

-- Catch-all: the named drop above didn't match live (the name likely has an
-- invisible character), so remove every non-SELECT policy on both tables
-- whatever it's called.
do $$
declare
  p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items')
      and cmd <> 'SELECT'
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- orders had no SELECT policy at all live, so the account page's order
-- history (read from the browser) always came back empty. order_items'
-- read policy joins through orders, so it needs this too.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

-- Make sure RLS is still on (no policy = no access for anon/authenticated).
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
