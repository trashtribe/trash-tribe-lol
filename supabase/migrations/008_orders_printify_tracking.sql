-- Run this in Supabase → SQL Editor.
--
-- Lets the account page show real fulfillment/tracking status from Printify
-- instead of only the internal "pending/paid" status. printify_order_id is
-- set once we successfully push the order to Printify's Orders API
-- (lib/printify-order-fulfillment.ts); the rest are a cache of the last
-- lookup so we don't have to call Printify on every page load.

alter table public.orders
  add column if not exists printify_order_id text,
  add column if not exists printify_status text,
  add column if not exists tracking_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists tracking_checked_at timestamptz;

comment on column public.orders.printify_order_id is 'Order id returned by Printify after POST /shops/{shop_id}/orders.json.';
comment on column public.orders.printify_status is 'Cached Printify fulfillment status (e.g. pending, in-production, fulfilled), refreshed on demand via /api/order-tracking.';
