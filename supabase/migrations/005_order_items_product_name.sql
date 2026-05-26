-- Snapshot of product display title for receipts and confirmation emails.

alter table public.order_items
  add column if not exists product_name text;

comment on column public.order_items.product_name is 'Human-readable product title at checkout time.';
