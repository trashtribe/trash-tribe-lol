-- Persist Stripe PaymentIntent id on orders for webhook lookups (metadata alone is brittle).

alter table public.orders
  add column if not exists stripe_payment_intent_id text;

comment on column public.orders.stripe_payment_intent_id is 'Stripe PaymentIntent id (pi_…); used to reconcile payment_intent.succeeded.';

create index if not exists orders_stripe_payment_intent_id_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
