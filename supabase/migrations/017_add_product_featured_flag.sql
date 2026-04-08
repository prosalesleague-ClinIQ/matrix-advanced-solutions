-- Migration 017: Add featured flag to products
--
-- Featured products appear at the top of the catalog.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
