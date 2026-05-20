-- Fulfillment shipping snapshot on orders + Printify line item variant id.

alter table public.orders
  add column if not exists shipping_name text,
  add column if not exists shipping_address1 text,
  add column if not exists shipping_address2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_method text;

alter table public.order_items
  add column if not exists printify_variant_id text;

comment on column public.orders.shipping_name is 'Recipient full name at checkout.';
comment on column public.order_items.printify_variant_id is 'Printify variant id for fulfillment API.';
