import { resolveProductUnitPrice, resolveProductWholesaleOffer } from "@izibuy/shared-lib";

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
 */

/**
 * Сопоставляет productId из корзины с актуальными товарами и считает суммы.
 *
 * @param {import('../model/types.js').CartItemsByProductId} cartItems
 * @param {import('../../product/model/types.js').ProductFromApi[]} products
 * @returns {{ lines: CartLine[]; total: number }}
 */
export const selectCartLines = (cartItems, products) => {
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const lines = Object.entries(cartItems).map(([productId, quantity]) => {
    const product = productById.get(productId) ?? null;
    const qty = Math.floor(Number(quantity)) || 0;
    const unitPrice = resolveProductUnitPrice({
      productPrice: product?.productPrice,
      productWholesaleEnabled: product?.productWholesaleEnabled,
      productWholesaleMinQty: product?.productWholesaleMinQty,
      productWholesalePrice: product?.productWholesalePrice,
      quantity: qty,
    });
    const offer = resolveProductWholesaleOffer(product);
    const isWholesaleApplied = offer != null && qty >= offer.minQty;
    const wholesaleSavings = isWholesaleApplied
      ? (offer.retailPrice - offer.wholesalePrice) * qty
      : 0;
    return {
      productId,
      quantity: qty,
      product,
      unitPrice,
      lineTotal: unitPrice * qty,
      isMissing: product == null,
      isWholesaleApplied,
      wholesaleSavings,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
