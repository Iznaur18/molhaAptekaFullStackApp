import { apiClient } from "../../../shared/api/index.js";

/**
 * `POST /order/shipping-estimate` — сколько попросит служба за доставку.
 *
 * Считаем до оформления: покупатель платит курьеру при получении, и сумма
 * не должна оказаться сюрпризом у двери.
 *
 * @param {{ productIds: string[]; deliveryLat: number; deliveryLon: number }} input
 */
export async function fetchShippingEstimate({ productIds, deliveryLat, deliveryLon }) {
  const { data } = await apiClient.post("/order/shipping-estimate", {
    productIds,
    deliveryLat,
    deliveryLon,
  });
  return data?.data ?? { available: false };
}
