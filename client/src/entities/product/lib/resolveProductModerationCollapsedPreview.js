import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  productModerationHasDiscount,
  productModerationHasMissingImages,
  productModerationIsStale,
} from "./productModerationNeedsAttention.js";

/**
 * @param {import('../model/types.js').ProductFromApi | Record<string, unknown>} product
 * @param {number} [nowMs]
 */
export function resolveProductModerationCollapsedPreview(product, nowMs = Date.now()) {
  if (productModerationIsStale(product, nowMs)) {
    return PRODUCT_MODERATION_PAGE_UI.COLLAPSED_STALE;
  }
  if (productModerationHasDiscount(product)) {
    return PRODUCT_MODERATION_PAGE_UI.COLLAPSED_DISCOUNT;
  }
  if (productModerationHasMissingImages(product)) {
    return PRODUCT_MODERATION_PAGE_UI.COLLAPSED_MISSING_IMAGES;
  }
  return null;
}
