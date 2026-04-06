/**
 * Matrix Advanced Solutions — Tier Pricing Logic
 *
 * All pricing is stored per-product in the `products` table as
 * `prices` and `costs` arrays with 4 tiers: [1+, 25+, 50+, 100+].
 *
 * Tier index mapping:
 *   0 → 1+   units
 *   1 → 25+  units
 *   2 → 50+  units
 *   3 → 100+ units
 */

export const TIER_BREAKPOINTS = [1, 25, 50, 100] as const;
export const TIER_LABELS = ["1+", "25+", "50+", "100+"] as const;

export type TierIndex = 0 | 1 | 2 | 3;

export function getTierIndex(quantity: number): TierIndex {
  if (quantity >= 100) return 3;
  if (quantity >= 50) return 2;
  if (quantity >= 25) return 1;
  return 0;
}

export function getTierLabel(quantity: number): string {
  return TIER_LABELS[getTierIndex(quantity)];
}

export function getUnitPrice(prices: number[], quantity: number): number {
  const tierIdx = getTierIndex(quantity);
  return prices[tierIdx] ?? prices[0];
}

export function getUnitCost(costs: number[], quantity: number): number {
  const tierIdx = getTierIndex(quantity);
  return costs[tierIdx] ?? costs[0];
}

export function getLineTotal(prices: number[], quantity: number): number {
  return getUnitPrice(prices, quantity) * quantity;
}

export function getUnitMargin(
  prices: number[],
  costs: number[],
  quantity: number
): number {
  return getUnitPrice(prices, quantity) - getUnitCost(costs, quantity);
}

export function getMarginPercent(
  prices: number[],
  costs: number[],
  quantity: number
): number {
  const price = getUnitPrice(prices, quantity);
  if (price === 0) return 0;
  return ((price - getUnitCost(costs, quantity)) / price) * 100;
}
