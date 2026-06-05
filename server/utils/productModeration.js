import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
} from "../constants/productModerationConstants.js";
import { ADMIN_ROLE } from "./adminUserGuard.js";

export const MODERATOR_ROLE = "moderator";

const CONTENT_PATCH_KEYS = new Set([
  "productName",
  "productDescription",
  "productPrice",
  "productOldPrice",
  "productCategory",
  "productCategoryId",
  "productImageUrls",
  "productImageUrl",
  "productPreviewVideoUrl",
]);

/**
 * @param {string | undefined | null} userRole
 */
export const isModeratorRole = (userRole) => userRole === MODERATOR_ROLE;

/**
 * @param {string | undefined | null} userRole
 */
export const canModerateProductsRole = (userRole) =>
  userRole === ADMIN_ROLE || userRole === MODERATOR_ROLE;

/**
 * @param {Record<string, unknown>} body
 */
export const patchBodyTouchesModerationContent = (body) =>
  Object.keys(body).some((key) => CONTENT_PATCH_KEYS.has(key));

/**
 * @param {string | undefined | null} status
 */
export const normalizeProductModerationStatus = (status) => {
  if (status === PRODUCT_MODERATION_PENDING) return PRODUCT_MODERATION_PENDING;
  if (status === PRODUCT_MODERATION_REJECTED) return PRODUCT_MODERATION_REJECTED;
  return PRODUCT_MODERATION_APPROVED;
};

/** Товар виден покупателям в общем каталоге и доступен для покупки. */
export const isProductPubliclyListed = (product) =>
  normalizeProductModerationStatus(product?.productModerationStatus) ===
    PRODUCT_MODERATION_APPROVED && product?.productIsAvailable !== false;
