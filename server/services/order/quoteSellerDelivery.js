import {
  ORDER_FULFILLMENT_DELIVERY,
  PRODUCT_DELIVERY_CARRIER_SELLER,
} from "@molha/api-contract";

import { fetchAvailableProductsForOrder } from "./createOrder.js";
import { prepareSellerDeliveryBySeller } from "./sellerDeliveryFee.js";

/**
 * Котировка доставки продавца для корзины: тариф и расстояние по дорогам.
 *
 * Считает ровно тем путём, что и `createOrder`: та же проверка адреса, тот же
 * поиск точек, тот же маршрутизатор и общий кэш. Раньше корзина мерила
 * расстояние сама по клиентской точке, а заказ — по точке DaData, и
 * покупатель видел 180 ₽, а платил 210 ₽. Сумму из тарифа и стоимости товаров
 * корзина собирает функцией контракта — той же, что и сервер.
 *
 * @param {{
 *   productIds: string[];
 *   verifiedDeliveryAddress: Record<string, any>;
 *   deliveryAddressGeo?: { lat: number; lon: number } | null;
 * }} input
 */
export async function quoteSellerDelivery({
  productIds,
  verifiedDeliveryAddress,
  deliveryAddressGeo = null,
}) {
  const uniqueIds = [
    ...new Set((Array.isArray(productIds) ? productIds : []).map(String)),
  ];
  const productById = await fetchAvailableProductsForOrder(uniqueIds);

  // Только то, что везёт сам продавец: у курьеров и служб цена считается иначе.
  const sellerRows = Object.fromEntries(
    Object.entries(productById).filter(
      ([, row]) => row?.deliveryCarrier === PRODUCT_DELIVERY_CARRIER_SELLER,
    ),
  );
  if (Object.keys(sellerRows).length === 0) {
    return { sellers: [] };
  }

  /** @type {Record<string, string>} */
  const fulfillmentBySellerId = {};
  /** @type {Record<string, string>} */
  const deliveryCarrierBySellerId = {};
  for (const row of Object.values(sellerRows)) {
    fulfillmentBySellerId[row.sellerId] = ORDER_FULFILLMENT_DELIVERY;
    deliveryCarrierBySellerId[row.sellerId] = PRODUCT_DELIVERY_CARRIER_SELLER;
  }

  const prepared = await prepareSellerDeliveryBySeller({
    fulfillmentBySellerId,
    deliveryCarrierBySellerId,
    productById: sellerRows,
    deliveryAddress: verifiedDeliveryAddress,
    clientGeo: deliveryAddressGeo,
  });

  return {
    sellers: Object.entries(prepared).map(([sellerId, entry]) => ({
      sellerId,
      tariff: entry.tariff,
      distanceKm: entry.distanceKm,
      distanceSource: entry.distanceSource,
    })),
  };
}
