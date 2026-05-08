/**
 * @typedef {object} CartLine
 * @property {string} productId
 * @property {number} quantity
 * @property {import('../../product/model/types.js').ProductFromApi | null} product
 * @property {number} lineTotal
 * @property {boolean} isMissing
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
    const unitPrice = product?.productPrice ?? 0;
    const lineTotal = unitPrice * quantity;
    return {
      productId,
      quantity,
      product,
      lineTotal,
      isMissing: product == null,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
