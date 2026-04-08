-- Migration 019: Remove duplicate products and update originals
--
-- Migration 018 inserted products with -MG-V SKUs that duplicated
-- existing products with shorter SKUs. Delete the -MG-V dupes and
-- update the originals with the correct wholesale prices.

-- ═══════════════════════════════════════════════════════════════
-- 1. DELETE ALL -MG-V DUPLICATES (from seed 012 and migration 018)
-- ═══════════════════════════════════════════════════════════════

DELETE FROM public.products WHERE sku IN (
  -- Seed 012 originals (zero-priced, now superseded by short-SKU versions)
  'SEM-10MG-V', 'SEM-20MG-V',
  'TIR-10MG-V', 'TIR-20MG-V',
  'RET-10MG-V',
  'MOTSC-10MG-V', 'MOTSC-20MG-V',
  'NAD-500MG-V', 'NAD-1000MG-V',
  'OXY-10MG-V', 'PT141-10MG-V',
  'SEL-10MG-V',
  'BPC157-5MG-V', 'AOD9604-5MG-V',
  'CJC1295ND-5MG-V', 'CJC1295D-5MG-V',
  'EPI-50MG-V',
  'GHKCU-50MG-V', 'GHKCU-100MG-V',
  'VIP-10MG-V',
  'TB500-5MG-V', 'TB500-10MG-V',
  'TES-5MG-V', 'TES-10MG-V',
  -- Migration 018 new inserts that duplicate existing short-SKU products
  'SEM-5MG-V', 'SEM-60MG-V',
  'TIR-5MG-V', 'TIR-60MG-V',
  'RET-5MG-V', 'RET-20MG-V', 'RET-60MG-V',
  'BPC157-10MG-V',
  'IPA-5MG-V', 'IPA-10MG-V',
  'SEMAX-10MG-V', 'SEMAX-20MG-V',
  'GLOW70-V', 'KLOW80-V',
  'TESIPA-10MG-V',
  'WOLV-10MG-V', 'WOLVKPV-10MG-V'
);

-- ═══════════════════════════════════════════════════════════════
-- 2. UPDATE ALL EXISTING PRODUCTS WITH CORRECT WHOLESALE PRICES
-- ═══════════════════════════════════════════════════════════════

-- GLP-1
UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEMA-5';
UPDATE public.products SET prices = ARRAY[142.95, 124.30, 106.24, 84.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEMA-10';
UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEMA-20';
UPDATE public.products SET prices = ARRAY[257.31, 223.75, 191.24, 152.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEMA-60';

UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIRZ-5';
UPDATE public.products SET prices = ARRAY[171.53, 149.16, 127.49, 101.99], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIRZ-10';
UPDATE public.products SET prices = ARRAY[214.42, 186.45, 159.36, 127.49], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIRZ-20';
UPDATE public.products SET prices = ARRAY[328.79, 285.90, 244.36, 195.49], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIRZ-60';

UPDATE public.products SET prices = ARRAY[128.64, 111.86, 95.61, 76.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RETA-5';
UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RETA-10';
UPDATE public.products SET prices = ARRAY[243.01, 211.31, 180.61, 144.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RETA-20';
UPDATE public.products SET prices = ARRAY[357.37, 310.76, 265.61, 212.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RETA-60';

-- PEPTIDES
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Fat metabolism · GH fragment · body composition', updated_at = NOW() WHERE sku = 'AOD960-5';
UPDATE public.products SET prices = ARRAY[64.26, 55.88, 47.76, 38.21], description = 'Gut & tissue repair · injury recovery', updated_at = NOW() WHERE sku = 'BPC157-5';
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Gut & tissue repair · injury recovery', updated_at = NOW() WHERE sku = 'BPC157-10';
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'GH secretagogue · lean body composition', updated_at = NOW() WHERE sku = 'CJC129-ND';
UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Extended half-life GH release', updated_at = NOW() WHERE sku = 'CJC129-DAC';
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Telomere support · longevity & anti-aging', updated_at = NOW() WHERE sku = 'EPITAL-50';
UPDATE public.products SET prices = ARRAY[57.17, 49.71, 42.49, 33.99], description = 'Skin & tissue repair · wound healing', updated_at = NOW() WHERE sku = 'GHKCU-50';
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Skin & tissue repair · wound healing', updated_at = NOW() WHERE sku = 'GHKCU-100';
UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'Proprietary aesthetic & skin longevity blend', updated_at = NOW() WHERE sku = 'GLOW70-NA';
UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'GH pulse stimulation · sleep & recovery', updated_at = NOW() WHERE sku = 'IPAMOR-5';
UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'GH pulse stimulation · sleep & recovery', updated_at = NOW() WHERE sku = 'IPAMOR-10';
UPDATE public.products SET prices = ARRAY[200.13, 174.03, 148.74, 118.99], description = 'Proprietary longevity support blend', updated_at = NOW() WHERE sku = 'KLOW80-NA';
UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Mitochondrial peptide · metabolic health', updated_at = NOW() WHERE sku = 'MOTSC-10';
UPDATE public.products SET prices = ARRAY[100.05, 87.00, 74.36, 59.49], description = 'Cellular energy · longevity · neuroprotection', updated_at = NOW() WHERE sku = 'NAD-500';
UPDATE public.products SET prices = ARRAY[142.95, 124.30, 106.24, 84.99], description = 'Cellular energy · longevity · neuroprotection', updated_at = NOW() WHERE sku = 'NAD-1000';
UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Stress regulation · mood & social bonding', updated_at = NOW() WHERE sku = 'OXYTOC-10';
UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Sexual health · melanocortin receptor agonist', updated_at = NOW() WHERE sku = 'PT141-10';
UPDATE public.products SET prices = ARRAY[50.03, 43.50, 37.18, 29.74], description = 'Neuroprotective · focus & cognitive enhancement', updated_at = NOW() WHERE sku = 'SEMAX-10';
UPDATE public.products SET prices = ARRAY[64.32, 55.93, 47.80, 38.24], description = 'Neuroprotective · focus & cognitive enhancement', updated_at = NOW() WHERE sku = 'SEMAX-20';
UPDATE public.products SET prices = ARRAY[57.17, 49.71, 42.49, 33.99], description = 'Anxiolytic nootropic · mood & stress regulation', updated_at = NOW() WHERE sku = 'SELANK-10';
UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Cellular repair · anti-inflammatory · recovery', updated_at = NOW() WHERE sku = 'TB500-5';
UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Cellular repair · anti-inflammatory · recovery', updated_at = NOW() WHERE sku = 'TB500-10';
UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'GH-releasing peptide · visceral fat reduction', updated_at = NOW() WHERE sku = 'TESAMO-5';
UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'GH-releasing peptide · visceral fat reduction', updated_at = NOW() WHERE sku = 'TESAMO-10';
UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'Combined GH release + fat-loss protocol', updated_at = NOW() WHERE sku = 'TESAIP-10';
UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'Advanced healing & recovery peptide blend', updated_at = NOW() WHERE sku = 'WOLVER-10';
UPDATE public.products SET prices = ARRAY[100.05, 87.00, 74.36, 59.49], description = 'Healing blend + KPV anti-inflammatory', updated_at = NOW() WHERE sku = 'WOLKPV-10';
