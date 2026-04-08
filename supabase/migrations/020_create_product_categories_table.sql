-- Migration 020: Create product_categories table
--
-- Managed list of product categories for the catalog.

CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed from existing product categories
INSERT INTO public.product_categories (name, display_order)
SELECT DISTINCT category,
  CASE category
    WHEN 'GLP-1' THEN 1
    WHEN 'Peptides' THEN 2
    ELSE 3
  END
FROM public.products
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;
