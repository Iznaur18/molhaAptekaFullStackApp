import { apiClient } from "../../../shared/api/index.js";

/**
 * `POST /order/seller-delivery-quote` — тариф продавца и расстояние по дорогам.
 *
 * Расстояние считает сервер тем же путём, что и заказ: корзина больше не
 * меряет его сама по своей точке, иначе суммы расходились.
 *
 * @param {{
 *   productIds: string[];
 *   deliveryAddress: string;
 *   deliveryAddressFlat?: string;
 *   deliveryAddressGeo?: { lat: number; lon: number } | null;
 * }} input
 * @returns {Promise<{ sellers: Array<{
 *   sellerId: string;
 *   tariff: { paid: boolean; baseFeeRub: number; perKmRub: number; freeFromRub: number };
 *   distanceKm: number | null;
 *   distanceSource: "road" | "estimate" | null;
 * }> }>}
 */
export async function fetchSellerDeliveryQuote({
  productIds,
  deliveryAddress,
  deliveryAddressFlat = "",
  deliveryAddressGeo = null,
}) {
  const { data } = await apiClient.post("/order/seller-delivery-quote", {
    productIds,
    deliveryAddress,
    deliveryAddressFlat,
    deliveryAddressGeo,
  });
  return data?.data ?? { sellers: [] };
}
