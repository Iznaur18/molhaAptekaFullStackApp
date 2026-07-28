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
 * @returns {"pending" | "approved" | "rejected"}
 */
export function getProductModerationBadgeVariant(product) {
  const status = product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED;
  if (status === PRODUCT_MODERATION_PENDING) {
    return "pending";
  }
  if (status === PRODUCT_MODERATION_REJECTED) {
    return "rejected";
  }
  return "approved";
}

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function isProductModerationPending(product) {
  return (
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
    PRODUCT_MODERATION_PENDING
  );
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
 * Owner may edit at any moderation status (including pending).
 * Delete / catalog visibility stay gated separately.
 * @param {import('../model/types.js').ProductFromApi} [_product]
 */
export function canSellerEditProduct(_product) {
  return true;
}

/**
 * Owner may delete at any moderation status (including pending).
 * Catalog visibility stays gated separately.
 * @param {import('../model/types.js').ProductFromApi} [_product]
 */
export function canSellerDeleteProduct(_product) {
  return true;
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

/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @param {boolean} isMineMode
 * @returns {string | null}
 */
export function getProductModerationRejectionComment(product, isMineMode) {
  if (
    !isMineMode ||
    product.productModerationStatus !== PRODUCT_MODERATION_REJECTED
  ) {
    return null;
  }
  const comment = String(product.productModerationComment ?? "").trim();
  return comment || null;
}
