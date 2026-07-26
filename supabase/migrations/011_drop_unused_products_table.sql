-- Run this in Supabase → SQL Editor.
--
-- public.products existed in the live database but was never created by any
-- migration here, is empty, and nothing in the codebase references it
-- (Printify + lib/products.ts is the actual product source — see
-- "Printify integration — Option B" in Notion). Confirmed empty 26 jul 2026
-- before dropping.

drop table if exists public.products;
