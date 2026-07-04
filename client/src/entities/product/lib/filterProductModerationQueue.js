import {
  PRODUCT_MODERATION_VIEW_FILTER_DISCOUNT,
  PRODUCT_MODERATION_VIEW_FILTER_STALE,
} from "./productModerationViewFilters.js";
import {
  productModerationHasDiscount,
  productModerationIsStale,
  productModerationNeedsAttention,
} from "./productModerationNeedsAttention.js";

/**
 * @param {import('../model/types.js').ProductFromApi[]} products
 * @param {{ viewFilter?: string; attentionOnly?: boolean; nowMs?: number }} [options]
 */
export function filterProductModerationQueue(
  products,
  { viewFilter = "", attentionOnly = false, nowMs = Date.now() } = {},
) {
  let result = products;

  if (viewFilter === PRODUCT_MODERATION_VIEW_FILTER_STALE) {
    result = result.filter((product) => productModerationIsStale(product, nowMs));
  } else if (viewFilter === PRODUCT_MODERATION_VIEW_FILTER_DISCOUNT) {
    result = result.filter(productModerationHasDiscount);
  }

  if (attentionOnly) {
    result = result.filter((product) => productModerationNeedsAttention(product, nowMs));
  }

  return result;
}
