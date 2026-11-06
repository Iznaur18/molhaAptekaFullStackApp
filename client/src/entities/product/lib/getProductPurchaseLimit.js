import {
  isProductPointsSaleActive,
  normalizeProductPointsPerBuyerLimit,
} from "@molha/api-contract";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function getProductPurchaseLimit(product) {
  if (!product) {
    return 0;
  }
  if (product.productOutOfStock === true) {
    return 0;
  }
  const raw = product.productAvailableQuantity ?? product.productStockQuantity ?? 0;
  return Math.max(0, Math.floor(Number(raw) || 0));
}

/**
 * Сколько штук покупатель может положить в корзину: остаток, а у товара за
 * баллы ещё и лимит в одни руки. Прошлые покупки клиент не знает — их
 * досчитает сервер при оформлении. Бейджи остатка считают по
 * getProductPurchaseLimit: лимит в одни руки — не остаток.
 *
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function getProductCartQuantityLimit(product) {
  const stock = getProductPurchaseLimit(product);
  if (!isProductPointsSaleActive(product)) {
    return stock;
  }
  const perBuyer = normalizeProductPointsPerBuyerLimit(
    product?.productPointsPerBuyerLimit,
  );
  return perBuyer == null ? stock : Math.min(stock, perBuyer);
}
