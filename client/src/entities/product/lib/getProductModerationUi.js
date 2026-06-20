import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
} from "../model/productModerationConstants.js";

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function getProductModerationBadgeLabel(product) {
  const status = product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED;
  if (status === PRODUCT_MODERATION_PENDING) {
    return PRODUCT_MODERATION_PAGE_UI.BADGE_PENDING;
  }
  if (status === PRODUCT_MODERATION_REJECTED) {
    return PRODUCT_MODERATION_PAGE_UI.BADGE_REJECTED;
  }
  return PRODUCT_MODERATION_PAGE_UI.BADGE_APPROVED;
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function isProductModerationPending(product) {
  return (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) === PRODUCT_MODERATION_PENDING;
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @param {{ isMineMode?: boolean; isModerationQueue?: boolean }} context
 */
export function shouldShowProductModerationPendingOverlay(product, context = {}) {
  const { isMineMode = false, isModerationQueue = false } = context;
  return isProductModerationPending(product) && (isMineMode || isModerationQueue);
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function getProductModerationBadgeClassName(product) {
  const status = product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED;
  return `product-moderation-badge product-moderation-badge_${status}`;
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function canSellerEditProduct(product) {
  return (
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) !==
    PRODUCT_MODERATION_PENDING
  );
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function canSellerDeleteProduct(product) {
  return (
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
    PRODUCT_MODERATION_APPROVED
  );
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function canSellerToggleCatalogVisibility(product) {
  return (
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
    PRODUCT_MODERATION_APPROVED
  );
}
