-- Run this in Supabase → SQL Editor.
--
-- Fixes wishlist rows duplicating: the unique(user_id, product_id) constraint
-- declared in 001_initial_schema.sql may not actually be present on the live
-- table, which let repeated sign-in events insert the same product multiple
-- times. This migration removes any existing duplicates and (re)creates the
-- uniqueness guarantee via an idempotent unique index.

-- 1) Remove duplicate rows, keeping the earliest one per (user_id, product_id).
delete from public.wishlist
where id in (
  select id from (
    select
      id,
      row_number() over (
        partition by user_id, product_id
        order by created_at asc, id asc
      ) as rn
    from public.wishlist
  ) ranked
  where ranked.rn > 1
);

-- 2) Guarantee uniqueness going forward (safe to re-run).
create unique index if not exists wishlist_unique_user_product_idx
  on public.wishlist (user_id, product_id);
