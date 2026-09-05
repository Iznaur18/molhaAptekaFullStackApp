import { AppError } from "../../errors/AppError.js";

export const CREATE_ORDER_MULTI_SELLER_MESSAGE =
  "В одном заказе могут быть товары только одного продавца. Оформите каждый отдельно.";

/**
 * Новый заказ — один продавец. Старые multi-seller заказы в БД не трогаем.
 * @param {Record<string, { sellerId?: unknown }>} productById
 */
export function assertCreateOrderSingleSeller(productById) {
  const sellerIds = [
    ...new Set(
      Object.values(productById).map((row) => String(row?.sellerId ?? "")),
    ),
  ].filter(Boolean);

  if (sellerIds.length > 1) {
    throw new AppError(400, CREATE_ORDER_MULTI_SELLER_MESSAGE);
  }
}
