-- Run this in Supabase → SQL Editor.
--
-- order_items never got a created_at column (checked all migrations
-- 001-009 — it's missing). In practice line items are always inserted in
-- the same request as their parent order, so orders.created_at is a good
-- proxy today, but this backfills a real timestamp per line so that stays
-- true even if that assumption ever changes (e.g. adding items to an
-- existing order later).

alter table public.order_items
  add column if not exists created_at timestamptz not null default now();

comment on column public.order_items.created_at is 'When this line item was added to the order.';
