import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
} from "@molha/api-contract";

/**
 * Раскладывает товары заказа по способам получения.
 *
 * Раньше способ был один на весь заказ, и покупатель, взявший товар у
 * продавца-самовывозчика и у продавца с доставкой, получал 400. Теперь способ
 * выбирается на отправление — то есть на продавца.
 *
 * Покупатель присылает выбор по продавцам; чего он не прислал, считается общим
 * способом заказа — так старые клиенты продолжают работать без изменений.
 *
 * @param {{
 *   productIds: string[];
 *   productById: Record<string, { sellerId?: unknown }>;
 *   fulfillmentBySellerId?: Record<string, string> | null;
 *   fallbackFulfillment: "pickup" | "delivery";
 * }} input
 */
export const resolveOrderFulfillmentSplit = ({
  productIds,
  productById,
  fulfillmentBySellerId = null,
  fallbackFulfillment,
}) => {
  const normalizedFallback =
    fallbackFulfillment === ORDER_FULFILLMENT_DELIVERY
      ? ORDER_FULFILLMENT_DELIVERY
      : ORDER_FULFILLMENT_PICKUP;

  /** @type {Record<string, "pickup" | "delivery">} */
  const fulfillmentByProductId = {};
  /** @type {Record<string, "pickup" | "delivery">} */
  const fulfillmentBySeller = {};
  const deliveryProductIds = [];
  const pickupProductIds = [];

  for (const productId of productIds) {
    const sellerId = productById[productId]?.sellerId
      ? String(productById[productId].sellerId)
      : "";
    const requested = sellerId ? fulfillmentBySellerId?.[sellerId] : undefined;
    const method =
      requested === ORDER_FULFILLMENT_DELIVERY
        ? ORDER_FULFILLMENT_DELIVERY
        : requested === ORDER_FULFILLMENT_PICKUP
          ? ORDER_FULFILLMENT_PICKUP
          : normalizedFallback;

    fulfillmentByProductId[productId] = method;
    if (sellerId) {
      fulfillmentBySeller[sellerId] = method;
    }
    if (method === ORDER_FULFILLMENT_DELIVERY) {
      deliveryProductIds.push(productId);
    } else {
      pickupProductIds.push(productId);
    }
  }

  return {
    fulfillmentByProductId,
    fulfillmentBySellerId: fulfillmentBySeller,
    deliveryProductIds,
    pickupProductIds,
    hasDelivery: deliveryProductIds.length > 0,
    hasPickup: pickupProductIds.length > 0,
    /**
     * Способ на заказ целиком — legacy-поле и фолбэк для заказов до
     * отправлений. Доставка «сильнее»: если хоть что-то едет, адрес
     * покупателя заказу нужен.
     */
    orderFulfillmentMethod:
      deliveryProductIds.length > 0
        ? ORDER_FULFILLMENT_DELIVERY
        : ORDER_FULFILLMENT_PICKUP,
  };
};
