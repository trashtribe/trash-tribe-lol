-- Guest checkout: orders may omit user_id; contact email stored on the row.

alter table public.orders
  add column if not exists guest_email text;

alter table public.orders
  alter column user_id drop not null;

comment on column public.orders.guest_email is 'Checkout email when user_id is null (guest order).';
