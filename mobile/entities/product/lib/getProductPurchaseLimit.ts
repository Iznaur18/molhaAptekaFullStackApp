import {
  isProductPointsSaleActive,
  normalizeProductPointsPerBuyerLimit,
} from "@molha/api-contract";

export const getProductPurchaseLimit = (product: unknown): number => {
  if (!product || typeof product !== "object") {
    return 0;
  }

  const source = product as {
    productOutOfStock?: unknown;
    productAvailableQuantity?: unknown;
    productStockQuantity?: unknown;
  };

  if (source.productOutOfStock === true) {
    return 0;
  }

  const raw = source.productAvailableQuantity ?? source.productStockQuantity ?? 0;
  return Math.max(0, Math.floor(Number(raw) || 0));
};

/**
 * Сколько штук покупатель может положить в корзину: остаток, а у товара за
 * баллы ещё и лимит в одни руки. Прошлые покупки клиент не знает — их
 * досчитает сервер при оформлении. Бейджи остатка считают по
 * getProductPurchaseLimit: лимит в одни руки — не остаток.
 */
export const getProductCartQuantityLimit = (product: unknown): number => {
  const stock = getProductPurchaseLimit(product);
  const source = (product ?? null) as {
    productPointsSaleEnabled?: unknown;
    productPointsPrice?: unknown;
    productPointsPerBuyerLimit?: unknown;
  } | null;
  if (!isProductPointsSaleActive(source)) {
    return stock;
  }
  const perBuyer = normalizeProductPointsPerBuyerLimit(
    source?.productPointsPerBuyerLimit,
  );
  return perBuyer == null ? stock : Math.min(stock, perBuyer);
};
