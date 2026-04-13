-- Migration 023: Product bundles
--
-- Adds fixed-price bundle packs — admin curates component products and sets
-- a bundle-specific 4-tier price. Bundles appear in the catalog alongside
-- regular products but are a separate entity.
--
-- Tables:
--   product_bundles       — bundle metadata (name, sku, prices, image, etc.)
--   product_bundle_items  — which products + quantities are in each bundle
--
-- Orders:
--   order_items gets a nullable `bundle_id` column. A bundle in the cart
--   becomes one order_item row with bundle_id set and product_id = NULL.
--   The bundle's components are frozen into the snapshot at order time.

-- ════════════════════════════════════════════════════════════════
-- PART 1: Tables
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Bundles',
  description TEXT,
  prices NUMERIC[] NOT NULL CHECK (array_length(prices, 1) = 4),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_bundles_active ON public.product_bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_product_bundles_category ON public.product_bundles(category);

CREATE TABLE IF NOT EXISTS public.product_bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bundle_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_bundle_items_bundle_id ON public.product_bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_bundle_items_product_id ON public.product_bundle_items(product_id);

-- ════════════════════════════════════════════════════════════════
-- PART 2: order_items gets a bundle_id column
-- ════════════════════════════════════════════════════════════════
-- When a bundle is ordered, order_items.bundle_id is set and product_id is NULL.
-- The `sku` and `product_name` columns still get populated (from the bundle).
-- The bundle's components at the time of purchase are stored in a new
-- `bundle_snapshot` JSONB column so the invoice remains stable even if the
-- bundle definition changes later.

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS bundle_snapshot JSONB;

-- product_id used to be NOT NULL. Relax it so bundle rows can have NULL product_id.
ALTER TABLE public.order_items
  ALTER COLUMN product_id DROP NOT NULL;

-- Enforce that every row has either a product_id OR a bundle_id (never both, never neither).
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_product_or_bundle_check;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_or_bundle_check
  CHECK (
    (product_id IS NOT NULL AND bundle_id IS NULL) OR
    (product_id IS NULL AND bundle_id IS NOT NULL)
  );

-- ════════════════════════════════════════════════════════════════
-- PART 3: RLS policies
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundle_items ENABLE ROW LEVEL SECURITY;

-- product_bundles: active bundles visible to all auth users, admin manages
CREATE POLICY "product_bundles_select" ON public.product_bundles
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "product_bundles_admin_insert" ON public.product_bundles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "product_bundles_admin_update" ON public.product_bundles
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "product_bundles_admin_delete" ON public.product_bundles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- product_bundle_items: visible wherever the parent bundle is visible, admin manages
CREATE POLICY "product_bundle_items_select" ON public.product_bundle_items
  FOR SELECT TO authenticated
  USING (
    bundle_id IN (
      SELECT id FROM public.product_bundles
      WHERE is_active = true OR public.is_admin()
    )
  );

CREATE POLICY "product_bundle_items_admin_insert" ON public.product_bundle_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "product_bundle_items_admin_update" ON public.product_bundle_items
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "product_bundle_items_admin_delete" ON public.product_bundle_items
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ════════════════════════════════════════════════════════════════
-- PART 4: Trigger to keep updated_at current on product_bundles
-- ════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS product_bundles_updated_at ON public.product_bundles;
CREATE TRIGGER product_bundles_updated_at
  BEFORE UPDATE ON public.product_bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ════════════════════════════════════════════════════════════════
-- PART 5: Seed "Bundles" category
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.product_categories (name, display_order, is_active)
VALUES ('Bundles', 0, true)
ON CONFLICT (name) DO NOTHING;
