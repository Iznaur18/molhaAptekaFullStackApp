import {
  productModerationHasDiscount,
  productModerationIsStale,
  productModerationNeedsAttention,
} from "./productModerationNeedsAttention.js";

/**
 * @param {import('../model/types.js').ProductFromApi[]} products
 * @param {number} [nowMs]
 */
export function summarizeProductModerationQueue(products, nowMs = Date.now()) {
  let staleCount = 0;
  let discountCount = 0;
  let attentionCount = 0;

  for (const product of products) {
    if (productModerationIsStale(product, nowMs)) {
      staleCount += 1;
    }
    if (productModerationHasDiscount(product)) {
      discountCount += 1;
    }
    if (productModerationNeedsAttention(product, nowMs)) {
      attentionCount += 1;
    }
  }

  return {
    queueCount: products.length,
    staleCount,
    discountCount,
    attentionCount,
  };
}
