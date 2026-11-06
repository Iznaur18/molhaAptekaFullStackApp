import { apiClient } from "@/shared/api";

/**
 * Ответ `POST /order/shipping-estimate`. `available: false` с `blocking` —
 * служба не возит по адресу, оформлять нельзя; `reason: "not_external"` —
 * товар везёт продавец или курьеры Gitorg, считать нечего.
 */
export type ShippingEstimate = {
  available: boolean;
  carrier?: string;
  finalCost?: number;
  approximate?: boolean;
  reason?: string;
  blocking?: boolean;
  message?: string;
};

/**
 * `POST /order/shipping-estimate` — сколько попросит внешняя служба (ЛОБО)
 * за доставку. Считаем до оформления: покупатель платит курьеру при
 * получении, и сумма не должна оказаться сюрпризом у двери (паритет web).
 */
export const fetchShippingEstimate = async ({
  productIds,
  deliveryLat,
  deliveryLon,
  deliveryAddress = "",
}: {
  productIds: readonly string[];
  deliveryLat: number;
  deliveryLon: number;
  deliveryAddress?: string;
}): Promise<ShippingEstimate> => {
  const { data } = await apiClient.post("/order/shipping-estimate", {
    productIds,
    deliveryLat,
    deliveryLon,
    ...(deliveryAddress ? { deliveryAddress } : {}),
  });
  return (data as { data?: ShippingEstimate } | null)?.data ?? { available: false };
};
