-- Migration 018: Update all product prices from wholesale price sheet
--
-- Sets exact 4-tier prices from the Matrix Wholesale Pricing Schedule.
-- Also adds new products that don't exist yet (new strengths, blends).
-- Costs are NOT changed by this migration.

-- ─── Get default supplier ID ────────────────────────────────────
DO $$
DECLARE
  default_supplier UUID;
BEGIN
  SELECT id INTO default_supplier FROM public.suppliers WHERE name = 'Matrix Advanced Solutions' LIMIT 1;

  -- ═══════════════════════════════════════════════════════════════
  -- GLP-1 WEIGHT LOSS LINE
  -- ═══════════════════════════════════════════════════════════════

  -- Semaglutide 5mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Semaglutide 5mg', 'SEM-5MG-V', 'GLP-1', 'vial',
    ARRAY[85.77, 74.58, 63.74, 50.99]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'GLP-1 receptor agonist · weight & metabolic management'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEM-5MG-V');
  UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEM-5MG-V';

  -- Semaglutide 10mg
  UPDATE public.products SET prices = ARRAY[142.95, 124.30, 106.24, 84.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEM-10MG-V';

  -- Semaglutide 20mg
  UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEM-20MG-V';

  -- Semaglutide 60mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Semaglutide 60mg', 'SEM-60MG-V', 'GLP-1', 'vial',
    ARRAY[257.31, 223.75, 191.24, 152.99]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'GLP-1 receptor agonist · weight & metabolic management'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEM-60MG-V');
  UPDATE public.products SET prices = ARRAY[257.31, 223.75, 191.24, 152.99], description = 'GLP-1 receptor agonist · weight & metabolic management', updated_at = NOW() WHERE sku = 'SEM-60MG-V';

  -- Tirzepatide 5mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Tirzepatide 5mg', 'TIR-5MG-V', 'GLP-1', 'vial',
    ARRAY[92.91, 80.79, 69.05, 55.24]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TIR-5MG-V');
  UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIR-5MG-V';

  -- Tirzepatide 10mg
  UPDATE public.products SET prices = ARRAY[171.53, 149.16, 127.49, 101.99], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIR-10MG-V';

  -- Tirzepatide 20mg
  UPDATE public.products SET prices = ARRAY[214.42, 186.45, 159.36, 127.49], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIR-20MG-V';

  -- Tirzepatide 60mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Tirzepatide 60mg', 'TIR-60MG-V', 'GLP-1', 'vial',
    ARRAY[328.79, 285.90, 244.36, 195.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TIR-60MG-V');
  UPDATE public.products SET prices = ARRAY[328.79, 285.90, 244.36, 195.49], description = 'Dual GIP/GLP-1 agonist · enhanced weight loss outcomes', updated_at = NOW() WHERE sku = 'TIR-60MG-V';

  -- Retatrutide 5mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Retatrutide 5mg', 'RET-5MG-V', 'GLP-1', 'vial',
    ARRAY[128.64, 111.86, 95.61, 76.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'RET-5MG-V');
  UPDATE public.products SET prices = ARRAY[128.64, 111.86, 95.61, 76.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RET-5MG-V';

  -- Retatrutide 10mg
  UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RET-10MG-V';

  -- Retatrutide 20mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Retatrutide 20mg', 'RET-20MG-V', 'GLP-1', 'vial',
    ARRAY[243.01, 211.31, 180.61, 144.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'RET-20MG-V');
  UPDATE public.products SET prices = ARRAY[243.01, 211.31, 180.61, 144.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RET-20MG-V';

  -- Retatrutide 60mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Retatrutide 60mg', 'RET-60MG-V', 'GLP-1', 'vial',
    ARRAY[357.37, 310.76, 265.61, 212.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'RET-60MG-V');
  UPDATE public.products SET prices = ARRAY[357.37, 310.76, 265.61, 212.49], description = 'Triple agonist (GIP/GLP-1/Gcg) · rising market demand', updated_at = NOW() WHERE sku = 'RET-60MG-V';

  -- ═══════════════════════════════════════════════════════════════
  -- PEPTIDES — LONGEVITY, REGENERATION & PERFORMANCE
  -- ═══════════════════════════════════════════════════════════════

  -- AOD-9604 5mg
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Fat metabolism · GH fragment · body composition', updated_at = NOW() WHERE sku = 'AOD9604-5MG-V';

  -- BPC-157 5mg
  UPDATE public.products SET prices = ARRAY[64.26, 55.88, 47.76, 38.21], description = 'Gut & tissue repair · injury recovery', updated_at = NOW() WHERE sku = 'BPC157-5MG-V';

  -- BPC-157 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'BPC-157 10mg', 'BPC157-10MG-V', 'Peptides', 'vial',
    ARRAY[78.61, 68.36, 58.43, 46.74]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Gut & tissue repair · injury recovery'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'BPC157-10MG-V');
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Gut & tissue repair · injury recovery', updated_at = NOW() WHERE sku = 'BPC157-10MG-V';

  -- CJC-1295 No DAC
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'GH secretagogue · lean body composition', updated_at = NOW() WHERE sku = 'CJC1295ND-5MG-V';

  -- CJC-1295 With DAC
  UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Extended half-life GH release', updated_at = NOW() WHERE sku = 'CJC1295D-5MG-V';

  -- Epitalon 50mg
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Telomere support · longevity & anti-aging', updated_at = NOW() WHERE sku = 'EPI-50MG-V';

  -- GHK-Cu 50mg
  UPDATE public.products SET prices = ARRAY[57.17, 49.71, 42.49, 33.99], description = 'Skin & tissue repair · wound healing', updated_at = NOW() WHERE sku = 'GHKCU-50MG-V';

  -- GHK-Cu 100mg
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Skin & tissue repair · wound healing', updated_at = NOW() WHERE sku = 'GHKCU-100MG-V';

  -- GLOW-70 Blend (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'GLOW-70 Blend', 'GLOW70-V', 'Peptides', 'vial',
    ARRAY[185.83, 161.59, 138.11, 110.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Proprietary aesthetic & skin longevity blend'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'GLOW70-V');
  UPDATE public.products SET prices = ARRAY[185.83, 161.59, 138.11, 110.49], description = 'Proprietary aesthetic & skin longevity blend', updated_at = NOW() WHERE sku = 'GLOW70-V';

  -- Ipamorelin 5mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Ipamorelin 5mg', 'IPA-5MG-V', 'Peptides', 'vial',
    ARRAY[71.46, 62.14, 53.11, 42.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'GH pulse stimulation · sleep & recovery'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'IPA-5MG-V');
  UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'GH pulse stimulation · sleep & recovery', updated_at = NOW() WHERE sku = 'IPA-5MG-V';

  -- Ipamorelin 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Ipamorelin 10mg', 'IPA-10MG-V', 'Peptides', 'vial',
    ARRAY[92.91, 80.79, 69.05, 55.24]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'GH pulse stimulation · sleep & recovery'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'IPA-10MG-V');
  UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'GH pulse stimulation · sleep & recovery', updated_at = NOW() WHERE sku = 'IPA-10MG-V';

  -- KLOW-80 Blend (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'KLOW-80 Blend', 'KLOW80-V', 'Peptides', 'vial',
    ARRAY[200.13, 174.03, 148.74, 118.99]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Proprietary longevity support blend'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'KLOW80-V');
  UPDATE public.products SET prices = ARRAY[200.13, 174.03, 148.74, 118.99], description = 'Proprietary longevity support blend', updated_at = NOW() WHERE sku = 'KLOW80-V';

  -- MOTS-c 10mg
  UPDATE public.products SET prices = ARRAY[78.61, 68.36, 58.43, 46.74], description = 'Mitochondrial peptide · metabolic health', updated_at = NOW() WHERE sku = 'MOTSC-10MG-V';

  -- NAD+ 500mg
  UPDATE public.products SET prices = ARRAY[100.05, 87.00, 74.36, 59.49], description = 'Cellular energy · longevity · neuroprotection', updated_at = NOW() WHERE sku = 'NAD-500MG-V';

  -- NAD+ 1000mg
  UPDATE public.products SET prices = ARRAY[142.95, 124.30, 106.24, 84.99], description = 'Cellular energy · longevity · neuroprotection', updated_at = NOW() WHERE sku = 'NAD-1000MG-V';

  -- Oxytocin 10mg
  UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Stress regulation · mood & social bonding', updated_at = NOW() WHERE sku = 'OXY-10MG-V';

  -- PT-141 10mg
  UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Sexual health · melanocortin receptor agonist', updated_at = NOW() WHERE sku = 'PT141-10MG-V';

  -- SEMAX 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'SEMAX 10mg', 'SEMAX-10MG-V', 'Peptides', 'vial',
    ARRAY[50.03, 43.50, 37.18, 29.74]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Neuroprotective · focus & cognitive enhancement'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEMAX-10MG-V');
  UPDATE public.products SET prices = ARRAY[50.03, 43.50, 37.18, 29.74], description = 'Neuroprotective · focus & cognitive enhancement', updated_at = NOW() WHERE sku = 'SEMAX-10MG-V';

  -- SEMAX 20mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'SEMAX 20mg', 'SEMAX-20MG-V', 'Peptides', 'vial',
    ARRAY[64.32, 55.93, 47.80, 38.24]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Neuroprotective · focus & cognitive enhancement'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'SEMAX-20MG-V');
  UPDATE public.products SET prices = ARRAY[64.32, 55.93, 47.80, 38.24], description = 'Neuroprotective · focus & cognitive enhancement', updated_at = NOW() WHERE sku = 'SEMAX-20MG-V';

  -- Selank 10mg
  UPDATE public.products SET prices = ARRAY[57.17, 49.71, 42.49, 33.99], description = 'Anxiolytic nootropic · mood & stress regulation', updated_at = NOW() WHERE sku = 'SEL-10MG-V';

  -- TB-500 5mg
  UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'Cellular repair · anti-inflammatory · recovery', updated_at = NOW() WHERE sku = 'TB500-5MG-V';

  -- TB-500 10mg
  UPDATE public.products SET prices = ARRAY[92.91, 80.79, 69.05, 55.24], description = 'Cellular repair · anti-inflammatory · recovery', updated_at = NOW() WHERE sku = 'TB500-10MG-V';

  -- Tesamorelin 5mg
  UPDATE public.products SET prices = ARRAY[71.46, 62.14, 53.11, 42.49], description = 'GH-releasing peptide · visceral fat reduction', updated_at = NOW() WHERE sku = 'TES-5MG-V';

  -- Tesamorelin 10mg
  UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'GH-releasing peptide · visceral fat reduction', updated_at = NOW() WHERE sku = 'TES-10MG-V';

  -- Tesa / Ipa Blend 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Tesa / Ipa Blend 10mg', 'TESIPA-10MG-V', 'Peptides', 'vial',
    ARRAY[85.77, 74.58, 63.74, 50.99]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Combined GH release + fat-loss protocol'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TESIPA-10MG-V');
  UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'Combined GH release + fat-loss protocol', updated_at = NOW() WHERE sku = 'TESIPA-10MG-V';

  -- Wolverine 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Wolverine 10mg', 'WOLV-10MG-V', 'Peptides', 'vial',
    ARRAY[85.77, 74.58, 63.74, 50.99]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Advanced healing & recovery peptide blend'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'WOLV-10MG-V');
  UPDATE public.products SET prices = ARRAY[85.77, 74.58, 63.74, 50.99], description = 'Advanced healing & recovery peptide blend', updated_at = NOW() WHERE sku = 'WOLV-10MG-V';

  -- Wolverine + KPV 10mg (NEW)
  INSERT INTO public.products (name, sku, category, unit, prices, costs, supplier_id, is_active, description)
  SELECT 'Wolverine + KPV 10mg', 'WOLVKPV-10MG-V', 'Peptides', 'vial',
    ARRAY[100.05, 87.00, 74.36, 59.49]::numeric[],
    ARRAY[0,0,0,0]::numeric[],
    default_supplier, true, 'Healing blend + KPV anti-inflammatory'
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'WOLVKPV-10MG-V');
  UPDATE public.products SET prices = ARRAY[100.05, 87.00, 74.36, 59.49], description = 'Healing blend + KPV anti-inflammatory', updated_at = NOW() WHERE sku = 'WOLVKPV-10MG-V';

END $$;
