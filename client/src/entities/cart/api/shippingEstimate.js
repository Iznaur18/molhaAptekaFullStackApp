import { apiClient } from "../../../shared/api/index.js";

/**
 * `POST /order/shipping-estimate` — сколько попросит служба за доставку.
 *
 * Считаем до оформления: покупатель платит курьеру при получении, и сумма
 * не должна оказаться сюрпризом у двери.
 *
 * @param {{
 *   productIds: string[];
 *   deliveryLat: number;
 *   deliveryLon: number;
 *   deliveryAddress?: string;
 * }} input
 */
export async function fetchShippingEstimate({
  productIds,
  deliveryLat,
  deliveryLon,
  deliveryAddress = "",
}) {
  const { data } = await apiClient.post("/order/shipping-estimate", {
    productIds,
    deliveryLat,
    deliveryLon,
    ...(deliveryAddress ? { deliveryAddress } : {}),
  });
  return data?.data ?? { available: false };
}
