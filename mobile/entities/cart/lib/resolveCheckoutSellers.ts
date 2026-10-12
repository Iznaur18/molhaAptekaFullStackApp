export type CheckoutSeller = {
  sellerId: string;
  /** Что продавец принимает; пусто — «не настраивал», принимает всё. */
  sellerPaymentMethods: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Продавцы оформляемых товаров и способы оплаты, которые они принимают.
 *
 * Берём из `productSeller` товара — тем же путём, что и сайт в
 * `groupCartLinesBySeller`: сервер отдаёт `sellerPaymentMethods` в публичных
 * полях продавца и по ним же отклоняет заказ с непринятым способом.
 */
export function resolveCheckoutSellers(
  products: ReadonlyArray<unknown> | null | undefined,
): CheckoutSeller[] {
  const bySellerId = new Map<string, CheckoutSeller>();

  for (const product of Array.isArray(products) ? products : []) {
    if (!isRecord(product)) continue;
    const seller = product.productSeller;
    const sellerId = isRecord(seller)
      ? String(seller._id ?? "").trim()
      : typeof seller === "string"
        ? seller.trim()
        : "";
    if (!sellerId) continue;

    const methods =
      isRecord(seller) && Array.isArray(seller.sellerPaymentMethods)
        ? seller.sellerPaymentMethods.filter(
            (method): method is string => typeof method === "string",
          )
        : [];
    const known = bySellerId.get(sellerId);
    if (!known) {
      bySellerId.set(sellerId, { sellerId, sellerPaymentMethods: methods });
    } else if (known.sellerPaymentMethods.length === 0 && methods.length > 0) {
      known.sellerPaymentMethods = methods;
    }
  }

  return [...bySellerId.values()];
}
