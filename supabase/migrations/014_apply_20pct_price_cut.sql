-- Migration 014: Apply 20% price reduction to all products
--
-- Reduces all 4 tier prices by 20% across all active products.
-- Costs remain unchanged (margin compression, not cost reduction).
-- Round to 2 decimal places.

UPDATE public.products
SET
  prices = ARRAY[
    ROUND((prices[1] * 0.80)::numeric, 2),
    ROUND((prices[2] * 0.80)::numeric, 2),
    ROUND((prices[3] * 0.80)::numeric, 2),
    ROUND((prices[4] * 0.80)::numeric, 2)
  ],
  updated_at = NOW()
WHERE prices[1] > 0;
