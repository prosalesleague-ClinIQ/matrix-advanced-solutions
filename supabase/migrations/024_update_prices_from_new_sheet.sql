-- Migration 024: Update prices and add new products from updated price sheet
--
-- Source: updated pricing Matrix - Sheet1.csv (60 rows, 2026-04-14)
--
-- Strategy:
--   • 35 existing products get new 4-tier prices (UPDATE)
--   • 25 new SKUs get inserted (new higher strengths, CJC-1295 10mg
--     variants, CJC/Ipa blend, and a handful of new 20mg/100mg/10mg
--     variants that weren't in the prior sheet)
--   • 6 existing DB products are LEFT UNTOUCHED because they're not
--     in the new sheet:
--       GLOW70-NA, KLOW80-NA (proprietary blends)
--       WOLVER-10, WOLKPV-10 (Wolverine blends)
--       MusleLCK (flagship MuscleLock)
--       ML-SAMPLE-5 (MuscleLock sample pack)
--
-- Notes:
--   • CSV spells "Tirzepitide" — corrected to "Tirzepatide" on insert.
--   • CJC-1295 5mg rows keep their existing SKUs; the new 10mg rows
--     are appended as new SKUs.
--   • All costs stay at 0; use the admin product edit pages to set
--     cost-of-goods per product.
--   • Prices are stored as NUMERIC arrays [tier1, tier2, tier3, tier4].

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- PART 1: UPDATE existing products with new prices (35 rows)
-- ═══════════════════════════════════════════════════════════════

-- ─── GLP-1 ─────────────────────────────────────────────────────
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'SEMA-5';
UPDATE public.products SET prices = ARRAY[102.90, 97.76, 92.61, 87.47],   updated_at = NOW() WHERE sku = 'SEMA-10';
UPDATE public.products SET prices = ARRAY[147.00, 139.65, 132.30, 124.95],updated_at = NOW() WHERE sku = 'SEMA-20';
UPDATE public.products SET prices = ARRAY[238.14, 226.23, 214.33, 202.42],updated_at = NOW() WHERE sku = 'SEMA-60';

UPDATE public.products SET prices = ARRAY[88.20, 83.79, 79.38, 74.97],    updated_at = NOW() WHERE sku = 'TIRZ-5';
UPDATE public.products SET prices = ARRAY[117.60, 111.72, 105.84, 99.96], updated_at = NOW() WHERE sku = 'TIRZ-10';
UPDATE public.products SET prices = ARRAY[164.64, 156.41, 148.18, 139.94],updated_at = NOW() WHERE sku = 'TIRZ-20';
UPDATE public.products SET prices = ARRAY[264.60, 254.16, 240.79, 227.41],updated_at = NOW() WHERE sku = 'TIRZ-60';

UPDATE public.products SET prices = ARRAY[95.55, 90.77, 86.00, 81.22],    updated_at = NOW() WHERE sku = 'RETA-5';
UPDATE public.products SET prices = ARRAY[132.30, 125.69, 119.07, 112.45],updated_at = NOW() WHERE sku = 'RETA-10';
UPDATE public.products SET prices = ARRAY[183.75, 174.56, 165.38, 156.19],updated_at = NOW() WHERE sku = 'RETA-20';
UPDATE public.products SET prices = ARRAY[294.00, 279.30, 264.60, 249.90],updated_at = NOW() WHERE sku = 'RETA-60';

-- ─── Peptides — NAD+ ───────────────────────────────────────────
UPDATE public.products SET prices = ARRAY[88.20, 83.79, 79.38, 74.97],    updated_at = NOW() WHERE sku = 'NAD-500';
UPDATE public.products SET prices = ARRAY[123.48, 117.31, 111.13, 104.96],updated_at = NOW() WHERE sku = 'NAD-1000';

-- ─── Peptides — Recovery / Repair ──────────────────────────────
UPDATE public.products SET prices = ARRAY[58.80, 55.86, 52.92, 49.98],    updated_at = NOW() WHERE sku = 'TB500-5';
UPDATE public.products SET prices = ARRAY[80.85, 76.81, 72.77, 68.72],    updated_at = NOW() WHERE sku = 'TB500-10';
UPDATE public.products SET prices = ARRAY[58.80, 55.86, 52.92, 49.98],    updated_at = NOW() WHERE sku = 'BPC157-5';
UPDATE public.products SET prices = ARRAY[80.85, 76.81, 72.77, 68.72],    updated_at = NOW() WHERE sku = 'BPC157-10';

-- ─── Peptides — GH Secretagogues ───────────────────────────────
UPDATE public.products SET prices = ARRAY[66.15, 62.84, 59.54, 56.23],    updated_at = NOW() WHERE sku = 'TESAMO-5';
UPDATE public.products SET prices = ARRAY[92.61, 87.98, 83.35, 78.72],    updated_at = NOW() WHERE sku = 'TESAMO-10';
UPDATE public.products SET prices = ARRAY[66.15, 62.84, 59.54, 56.23],    updated_at = NOW() WHERE sku = 'IPAMOR-5';
UPDATE public.products SET prices = ARRAY[92.61, 87.98, 83.35, 78.72],    updated_at = NOW() WHERE sku = 'IPAMOR-10';

UPDATE public.products
  SET name = 'CJC-1295 (no DAC) 5mg',
      prices = ARRAY[58.80, 55.86, 52.92, 49.98],
      updated_at = NOW()
  WHERE sku = 'CJC129-ND-5';

UPDATE public.products
  SET name = 'CJC-1295 (with DAC) 5mg',
      prices = ARRAY[73.50, 69.83, 66.15, 62.48],
      updated_at = NOW()
  WHERE sku = 'CJC129-DAC-5';

-- Update the existing Tesa/Ipa Blend row with the cleaner name + new price.
-- (CSV misspells both peptides — we keep the correct spelling in the DB.)
UPDATE public.products
  SET name = 'Tesamorelin/Ipamorelin Blend 10mg',
      prices = ARRAY[88.20, 83.79, 79.38, 74.97],
      updated_at = NOW()
  WHERE sku = 'TESAIP-10';

-- ─── Peptides — Other ──────────────────────────────────────────
UPDATE public.products SET prices = ARRAY[51.45, 48.88, 46.30, 43.73],    updated_at = NOW() WHERE sku = 'GHKCU-50';
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'GHKCU-100';
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'MOTSC-10';
UPDATE public.products SET prices = ARRAY[66.15, 62.84, 59.54, 56.23],    updated_at = NOW() WHERE sku = 'PT141-10';
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'OXYTOC-10';
UPDATE public.products SET prices = ARRAY[51.45, 48.88, 46.30, 43.73],    updated_at = NOW() WHERE sku = 'SEMAX-10';
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'SEMAX-20';
UPDATE public.products SET prices = ARRAY[51.45, 48.88, 46.30, 43.73],    updated_at = NOW() WHERE sku = 'SELANK-10';
UPDATE public.products SET prices = ARRAY[80.85, 76.81, 72.77, 68.72],    updated_at = NOW() WHERE sku = 'AOD960-5';
UPDATE public.products SET prices = ARRAY[73.50, 69.83, 66.15, 62.48],    updated_at = NOW() WHERE sku = 'EPITAL-50';

-- ═══════════════════════════════════════════════════════════════
-- PART 2: INSERT new products (25 rows)
-- ═══════════════════════════════════════════════════════════════
--
-- All new rows share the same default metadata: supplier stays NULL
-- (admin can assign via /admin/products), costs = 0, is_active = true,
-- is_featured = false.
--
-- Uses ON CONFLICT DO NOTHING so re-running the migration is safe
-- if a SKU got inserted out of band.

-- ─── Semaglutide (5 new strengths) ─────────────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('Semaglutide 30mg',   'SEMA-30',   'GLP-1', 'vial', ARRAY[183.75, 174.56, 165.38, 156.19],              ARRAY[0,0,0,0]::numeric[], true, 'GLP-1 receptor agonist · weight & metabolic management'),
  ('Semaglutide 100mg',  'SEMA-100',  'GLP-1', 'vial', ARRAY[352.80, 335.16, 317.52, 299.88],              ARRAY[0,0,0,0]::numeric[], true, 'GLP-1 receptor agonist · weight & metabolic management'),
  ('Semaglutide 250mg',  'SEMA-250',  'GLP-1', 'vial', ARRAY[849.66, 807.18, 764.69, 722.21],              ARRAY[0,0,0,0]::numeric[], true, 'GLP-1 receptor agonist · weight & metabolic management'),
  ('Semaglutide 500mg',  'SEMA-500',  'GLP-1', 'vial', ARRAY[1602.30, 1522.18, 1442.07, 1361.96],          ARRAY[0,0,0,0]::numeric[], true, 'GLP-1 receptor agonist · weight & metabolic management'),
  ('Semaglutide 1000mg', 'SEMA-1000', 'GLP-1', 'vial', ARRAY[2940.00, 2793.00, 2646.00, 2499.00],          ARRAY[0,0,0,0]::numeric[], true, 'GLP-1 receptor agonist · weight & metabolic management')
ON CONFLICT (sku) DO NOTHING;

-- ─── Tirzepatide (5 new strengths) ─────────────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('Tirzepatide 30mg',   'TIRZ-30',   'GLP-1', 'vial', ARRAY[205.80, 195.51, 185.22, 174.93],              ARRAY[0,0,0,0]::numeric[], true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'),
  ('Tirzepatide 100mg',  'TIRZ-100',  'GLP-1', 'vial', ARRAY[396.90, 377.06, 357.21, 337.37],              ARRAY[0,0,0,0]::numeric[], true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'),
  ('Tirzepatide 250mg',  'TIRZ-250',  'GLP-1', 'vial', ARRAY[955.50, 910.52, 862.60, 814.67],              ARRAY[0,0,0,0]::numeric[], true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'),
  ('Tirzepatide 500mg',  'TIRZ-500',  'GLP-1', 'vial', ARRAY[1764.00, 1717.70, 1627.29, 1536.88],          ARRAY[0,0,0,0]::numeric[], true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'),
  ('Tirzepatide 1000mg', 'TIRZ-1000', 'GLP-1', 'vial', ARRAY[2940.00, 2793.00, 2646.00, 2499.00],          ARRAY[0,0,0,0]::numeric[], true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes')
ON CONFLICT (sku) DO NOTHING;

-- ─── Retatrutide (5 new strengths) ─────────────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('Retatrutide 30mg',   'RETA-30',   'GLP-1', 'vial', ARRAY[227.85, 216.46, 205.07, 193.67],              ARRAY[0,0,0,0]::numeric[], true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'),
  ('Retatrutide 100mg',  'RETA-100',  'GLP-1', 'vial', ARRAY[441.00, 418.95, 396.90, 374.85],              ARRAY[0,0,0,0]::numeric[], true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'),
  ('Retatrutide 250mg',  'RETA-250',  'GLP-1', 'vial', ARRAY[1064.28, 1011.07, 957.85, 904.64],            ARRAY[0,0,0,0]::numeric[], true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'),
  ('Retatrutide 500mg',  'RETA-500',  'GLP-1', 'vial', ARRAY[2006.55, 1906.22, 1805.90, 1705.57],          ARRAY[0,0,0,0]::numeric[], true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'),
  ('Retatrutide 1000mg', 'RETA-1000', 'GLP-1', 'vial', ARRAY[3670.59, 3487.06, 3303.53, 3120.00],          ARRAY[0,0,0,0]::numeric[], true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand')
ON CONFLICT (sku) DO NOTHING;

-- ─── CJC-1295 10mg variants (new) ──────────────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('CJC-1295 (no DAC) 10mg',   'CJC129-ND-10',  'Peptides', 'vial', ARRAY[80.85, 76.81, 72.77, 68.72],     ARRAY[0,0,0,0]::numeric[], true, 'GH secretagogue · lean body composition'),
  ('CJC-1295 (with DAC) 10mg', 'CJC129-DAC-10', 'Peptides', 'vial', ARRAY[95.55, 90.77, 86.00, 81.22],     ARRAY[0,0,0,0]::numeric[], true, 'Extended half-life GH release')
ON CONFLICT (sku) DO NOTHING;

-- ─── CJC-1295 / Ipamorelin Blend (new) ─────────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('CJC-1295 / Ipamorelin Blend 10mg', 'IPACJC-ND-10', 'Peptides', 'vial', ARRAY[88.20, 83.79, 79.38, 74.97],  ARRAY[0,0,0,0]::numeric[], true, 'Combined CJC-1295 (no DAC) + Ipamorelin — GH release protocol'),
  ('CJC-1295 / Ipamorelin Blend 20mg', 'IPACJC-ND-20', 'Peptides', 'vial', ARRAY[124.95, 118.70, 112.45, 106.21], ARRAY[0,0,0,0]::numeric[], true, 'Combined CJC-1295 (no DAC) + Ipamorelin — GH release protocol')
ON CONFLICT (sku) DO NOTHING;

-- ─── New 20mg / 10mg / 100mg variants (new) ────────────────────
INSERT INTO public.products (name, sku, category, unit, prices, costs, is_active, description) VALUES
  ('MOTS-c 20mg',       'MOTSC-20',   'Peptides', 'vial', ARRAY[102.90, 97.76, 92.61, 87.47],    ARRAY[0,0,0,0]::numeric[], true, 'Mitochondrial peptide · metabolic health'),
  ('PT-141 20mg',       'PT141-20',   'Peptides', 'vial', ARRAY[92.61, 87.98, 83.35, 78.72],     ARRAY[0,0,0,0]::numeric[], true, 'Sexual health · melanocortin receptor agonist'),
  ('Oxytocin 20mg',     'OXYTOC-20',  'Peptides', 'vial', ARRAY[102.90, 97.76, 92.61, 87.47],    ARRAY[0,0,0,0]::numeric[], true, 'Stress regulation · mood & social bonding'),
  ('Selank 20mg',       'SELANK-20',  'Peptides', 'vial', ARRAY[73.50, 69.83, 66.15, 62.48],     ARRAY[0,0,0,0]::numeric[], true, 'Anxiolytic nootropic · mood & stress regulation'),
  ('AOD-9604 10mg',     'AOD960-10',  'Peptides', 'vial', ARRAY[110.25, 104.74, 99.23, 93.71],   ARRAY[0,0,0,0]::numeric[], true, 'Fat metabolism · GH fragment · body composition'),
  ('Epitalon 100mg',    'EPITAL-100', 'Peptides', 'vial', ARRAY[102.90, 97.76, 92.61, 87.47],    ARRAY[0,0,0,0]::numeric[], true, 'Telomere support · longevity & anti-aging')
ON CONFLICT (sku) DO NOTHING;

COMMIT;
