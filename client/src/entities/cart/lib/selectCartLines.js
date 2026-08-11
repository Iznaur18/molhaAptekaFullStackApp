import {
  resolveProductUnitPriceWithPromo,
  resolveProductWholesaleOffer,
} from "@izibuy/shared-lib";

/**
 * @typedef {object} CartLine
 * @property {string} productId
 * @property {number} quantity
 * @property {import('../../product/model/types.js').ProductFromApi | null} product
 * @property {number} unitPrice
 * @property {number} lineTotal
 * @property {boolean} isMissing
 * @property {boolean} isWholesaleApplied
 * @property {number} wholesaleSavings
 * @property {number | null} promoDiscountPercent
 * @property {string | null} promoCode
 * @property {boolean} isPromoApplied
 */

/**
 * @param {import('../model/types.js').CartItemsByProductId} cartItems
 * @param {import('../../product/model/types.js').ProductFromApi[]} products
 * @param {Record<string, { code?: string; discountPercent?: number }> | Map<string, { code?: string; discountPercent?: number }> | Array<{ productId: string; code?: string; discountPercent?: number }>} [appliedPromos]
 */
export const selectCartLines = (cartItems, products, appliedPromos = {}) => {
  const productById = new Map(products.map((p) => [String(p._id), p]));
  /** @type {Map<string, { code?: string; discountPercent?: number }>} */
  const promoByProductId = new Map();
  if (Array.isArray(appliedPromos)) {
    for (const row of appliedPromos) {
      promoByProductId.set(String(row.productId), row);
    }
  } else if (appliedPromos instanceof Map) {
    for (const [productId, row] of appliedPromos.entries()) {
      promoByProductId.set(String(productId), row);
    }
  } else if (appliedPromos && typeof appliedPromos === "object") {
    for (const [productId, row] of Object.entries(appliedPromos)) {
      promoByProductId.set(String(productId), row);
    }
  }

  const lines = Object.entries(cartItems).map(([productId, quantity]) => {
    const product = productById.get(productId) ?? null;
    const qty = Math.floor(Number(quantity)) || 0;
    const promo = promoByProductId.get(productId) ?? null;
    const promoDiscountPercent =
      promo != null ? Math.floor(Number(promo.discountPercent)) || null : null;
    const unitPrice = resolveProductUnitPriceWithPromo({
      productPrice: product?.productPrice,
      productWholesaleEnabled: product?.productWholesaleEnabled,
      productWholesaleMinQty: product?.productWholesaleMinQty,
      productWholesalePrice: product?.productWholesalePrice,
      quantity: qty,
      promoDiscountPercent,
    });
    const offer = resolveProductWholesaleOffer(product);
    const isWholesaleApplied = offer != null && qty >= offer.minQty;
    const wholesaleSavings = isWholesaleApplied
      ? (offer.retailPrice - offer.wholesalePrice) * qty
      : 0;
    const isPromoApplied =
      promoDiscountPercent != null &&
      promoDiscountPercent >= 1 &&
      promoDiscountPercent <= 99;
    return {
      productId,
      quantity: qty,
      product,
      unitPrice,
      lineTotal: unitPrice * qty,
      isMissing: product == null,
      isWholesaleApplied,
      wholesaleSavings,
      promoDiscountPercent: isPromoApplied ? promoDiscountPercent : null,
      promoCode: isPromoApplied ? String(promo?.code ?? "") : null,
      isPromoApplied,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
