import { z } from "zod";

import { optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/userBlockConstants.js`. */
export const USER_BLOCK_MAX_PER_USER = 500;

export const USER_BLOCK_LIST_MAX_LIMIT = 50;

export const USER_BLOCKED_PURCHASE_MESSAGE = "Вы заблокированы";

export const userBlockListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(USER_BLOCK_LIST_MAX_LIMIT, `limit должен быть от 1 до ${USER_BLOCK_LIST_MAX_LIMIT}`)
    .optional(),
});

/**
 * Seed из списка каталога не содержит viewer-specific поля — нужен refetch `/product/:id/catalog`.
 *
 * @param {unknown} product
 * @returns {boolean}
 */
export function isCatalogProductViewerBlockStateKnown(product) {
  return product != null && typeof product === "object" && "isBlockedBySeller" in product;
}

/**
 * Seed из каталога не содержит `isSellerClosedNow`.
 *
 * @param {unknown} product
 * @returns {boolean}
 */
export function isCatalogProductSellerClosedStateKnown(product) {
  return product != null && typeof product === "object" && "isSellerClosedNow" in product;
}

/**
 * @param {unknown} product
 * @returns {boolean}
 */
export function isCatalogProductViewerPurchaseContextKnown(product) {
  return (
    isCatalogProductViewerBlockStateKnown(product) &&
    isCatalogProductSellerClosedStateKnown(product)
  );
}

/**
 * @param {unknown} product
 * @returns {boolean}
 */
export function isProductPurchaseBlockedBySeller(product) {
  return product != null && typeof product === "object" && product.isBlockedBySeller === true;
}
