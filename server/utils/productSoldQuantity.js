import { getDenormSoldQuantityByProductIds } from "./productSoldQuantityDenorm.js";

/**
 * @param {string[]} productIds
 * @returns {Promise<Record<string, number>>}
 */
export const getSoldQuantityByProductIds = getDenormSoldQuantityByProductIds;

/**
 * @param {{ productId: string; product: Record<string, unknown> | null }[]} items
 */
export const attachSoldQuantityToPurchaseItems = async (items) => {
  const soldById = await getSoldQuantityByProductIds(
    items.map((item) => item.productId),
  );

  return items.map((item) => {
    const soldQuantity = soldById[item.productId] ?? 0;
    if (item.product == null) {
      return { ...item, soldQuantity };
    }
    return {
      ...item,
      soldQuantity,
      product: { ...item.product, soldQuantity },
    };
  });
};
