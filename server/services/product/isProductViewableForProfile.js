import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";

export const PURCHASE_PRODUCT_PUBLIC_SELECT =
  "productName productDescription productImageUrls productImageUrl productPrice productSeller productCategory productIsAvailable productModerationStatus createdAt updatedAt";

/**
 * @param {Record<string, unknown> | null | undefined} product
 */
export const isProductViewableForProfile = (product) => {
  if (!product || typeof product !== "object") {
    return false;
  }
  if (product._id == null) {
    return false;
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return false;
  }
  if (product.productIsAvailable === false) {
    return false;
  }
  return true;
};
