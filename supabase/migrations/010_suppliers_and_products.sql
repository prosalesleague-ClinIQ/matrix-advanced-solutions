-- Migration 010: Suppliers Table & Product Enhancements
--
-- Adds:
-- 1. suppliers table for managing multiple compounding partners
-- 2. supplier_id FK on products (links products to their supplier)
-- 3. image_url on products (Supabase Storage URL for product images)
-- 4. supplier_id FK on batch_pos (tags batch POs to a supplier)

-- ─── suppliers table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address       TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── products additions ─────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id),
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ─── batch_pos additions ────────────────────────────────────────
ALTER TABLE public.batch_pos
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id);

-- ─── Storage bucket for product images ──────────────────────────
-- NOTE: You must also create the 'product-images' bucket in the
-- Supabase dashboard (Storage → New bucket → public, name: product-images)
-- or run:
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('product-images', 'product-images', true)
--   ON CONFLICT (id) DO NOTHING;
