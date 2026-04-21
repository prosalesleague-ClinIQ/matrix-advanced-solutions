-- Migration 027: Add free_shipping flag to products
--
-- Lets admins mark specific products as free-shipping (test SKUs, samples,
-- promos, goodwill comps). When EVERY item in an order has free_shipping
-- = true, the order's shipping_cost is zeroed at submit time.
--
-- Defaults to false so existing products keep charging shipping.

BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.free_shipping IS
  'When true, this product ships free. If every item in a cart is marked free_shipping, the order shipping_cost is zeroed.';

COMMIT;
