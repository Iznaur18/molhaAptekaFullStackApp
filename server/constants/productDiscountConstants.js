/** SSOT: `contract/src/productSale.js`. */
export { PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT } from "@molha/api-contract";

export const IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT =
  "followed_seller_product_discount";

/**
 * @param {string} sellerName
 * @param {string} productName
 * @param {number} discountPercent
 */
export const buildFollowedSellerProductDiscountMessage = (
  sellerName,
  productName,
  discountPercent,
) => {
  const seller = sellerName?.trim() || "Продавец";
  const product = productName?.trim() || "товар";
  const percent = Number.isFinite(discountPercent)
    ? Math.max(0, Math.floor(discountPercent))
    : 0;
  return `${seller}: скидка −${percent}% на «${product}»`;
};
