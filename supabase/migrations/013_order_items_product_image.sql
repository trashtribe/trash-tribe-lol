-- Run this in Supabase → SQL Editor.
--
-- Snapshot of the product's image at checkout time, so the confirmation
-- email can show a picture next to each item instead of the raw Printify
-- product_id. Same pattern as product_name (005): a snapshot, not a live
-- lookup, so it stays correct even if the product's photos change later.

alter table public.order_items
  add column if not exists product_image_url text;

comment on column public.order_items.product_image_url is 'Product image URL at checkout time, for the confirmation email.';
