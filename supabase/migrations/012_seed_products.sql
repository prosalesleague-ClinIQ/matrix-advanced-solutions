-- Migration 012: Seed Products with Images
--
-- Inserts all Matrix Advanced Solutions products with correct names,
-- SKUs, categories, and image_url paths pointing to /public/products/.
--
-- Images are served from the Next.js public folder at /products/[filename].
--
-- NOTE: All prices and costs are set to 0 (placeholder).
--       Update them via /admin/products before going live.
--
-- Uses INSERT ... WHERE NOT EXISTS so re-running is safe (idempotent).

-- ─── Default Supplier ────────────────────────────────────────────
-- Insert Matrix Advanced Solutions as the default supplier if not present.
INSERT INTO public.suppliers (name, is_active)
SELECT 'Matrix Advanced Solutions', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.suppliers WHERE name = 'Matrix Advanced Solutions'
);

-- ─── Helper: get the default supplier id ─────────────────────────
DO $$
DECLARE
  supplier_id UUID;
BEGIN
  SELECT id INTO supplier_id FROM public.suppliers WHERE name = 'Matrix Advanced Solutions' LIMIT 1;

  -- ─── GLP-1 Products ────────────────────────────────────────────

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Semaglutide 10mg', 'SEM-10MG-V', 'GLP-1', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/semaglutide-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEM-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Semaglutide 20mg', 'SEM-20MG-V', 'GLP-1', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEM-20MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Tirzepatide 10mg', 'TIR-10MG-V', 'GLP-1', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/tirzepatide-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TIR-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Tirzepatide 20mg', 'TIR-20MG-V', 'GLP-1', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TIR-20MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Retatrutide 10mg', 'RET-10MG-V', 'GLP-1', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/retatrutide-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'RET-10MG-V');

  -- ─── Peptides ───────────────────────────────────────────────────

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'MOTS-c 10mg', 'MOTSC-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/mots-c-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'MOTSC-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'MOTS-c 20mg', 'MOTSC-20MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'MOTSC-20MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'NAD+ 500mg', 'NAD-500MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/nad-plus-500mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'NAD-500MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'NAD+ 1000mg', 'NAD-1000MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/nad-plus-1000mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'NAD-1000MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Oxytocin 10mg', 'OXY-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/oxytocin-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'OXY-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'PT-141 10mg', 'PT141-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/pt-141-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'PT141-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Selank 10mg', 'SEL-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/selank-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEL-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'BPC-157 5mg', 'BPC157-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/bpc-157-5mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'BPC157-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'AOD-9604 5mg', 'AOD9604-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/aod-9604-5mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'AOD9604-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'CJC-1295 No DAC 5mg', 'CJC1295ND-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/cjc-1295-no-dac-5mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'CJC1295ND-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'CJC-1295 with DAC 5mg', 'CJC1295D-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/cjc-1295-dac-5mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'CJC1295D-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Epitalon 50mg', 'EPI-50MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/epitalon-50mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'EPI-50MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'GHK-Cu 50mg', 'GHKCU-50MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'GHKCU-50MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'GHK-Cu 100mg', 'GHKCU-100MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/ghk-cu-100mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'GHKCU-100MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'VIP 10mg', 'VIP-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], '/products/vip-10mg.png', supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'VIP-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'TB-500 5mg', 'TB500-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TB500-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'TB-500 10mg', 'TB500-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TB500-10MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Tesamorelin 5mg', 'TES-5MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TES-5MG-V');

  INSERT INTO public.products (name, sku, category, unit, prices, costs, image_url, supplier_id, is_active)
  SELECT 'Tesamorelin 10mg', 'TES-10MG-V', 'Peptides', 'vial', ARRAY[0,0,0,0]::numeric[], ARRAY[0,0,0,0]::numeric[], NULL, supplier_id, true
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TES-10MG-V');

END $$;
