import { PRODUCT_DELIVERY_CARRIER_LABEL_RU } from "@molha/api-contract";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";

import {
  fetchShippingEstimate,
  type ShippingEstimate,
} from "@/entities/cart/api/fetchShippingEstimate";
import type { CarrierDeliveryCost } from "@/features/checkout/ui/CheckoutCarrierDeliveryCost";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useCheckoutFormStyles } from "@/shared/theme/formChromeStyles";

const CARRIER_LABELS = PRODUCT_DELIVERY_CARRIER_LABEL_RU as Record<string, string>;

/**
 * Примерная цена внешней службы (ЛОБО) — паритет web `CheckoutShippingEstimate`.
 * Неудачный расчёт не мешает оформить заказ: сумму назовёт курьер. Служба не
 * возит по адресу (`blocking`) — оформлять нельзя, форма блокирует кнопку.
 * Посчитанную цену форма отдаёт в итог корзины.
 */
export const useShippingEstimate = ({
  productIds,
  geo,
  addressLine,
  enabled,
}: {
  productIds: readonly string[];
  geo: { lat: number; lon: number } | null;
  addressLine: string;
  enabled: boolean;
}) => {
  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  const hasGeo = geo != null && Number.isFinite(lat) && Number.isFinite(lon);
  const key = [...productIds].sort().join(",");
  // Не спрашиваем сервер на каждую букву адреса.
  const debouncedLine = useDebouncedValue(addressLine.trim(), 500);

  const query = useQuery({
    queryKey: ["shipping-estimate", key, lat, lon, debouncedLine],
    queryFn: async (): Promise<ShippingEstimate> => {
      try {
        return await fetchShippingEstimate({
          productIds: key.split(","),
          deliveryLat: lat,
          deliveryLon: lon,
          deliveryAddress: debouncedLine,
        });
      } catch (error) {
        reportClientIssue("useShippingEstimate", error);
        return { available: false };
      }
    },
    enabled: enabled && hasGeo && key.length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const estimate = enabled && hasGeo ? (query.data ?? null) : null;
  const blockMessage =
    estimate && !estimate.available && estimate.blocking === true
      ? String(estimate.message ?? "") || CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_OUT_OF_ZONE
      : "";
  const carrier = String(estimate?.carrier ?? "");
  const cost: CarrierDeliveryCost | null = estimate?.available
    ? {
        feeRub: Number(estimate.finalCost) || 0,
        label: CARRIER_LABELS[carrier] ?? carrier,
        approximate: estimate.approximate === true,
      }
    : null;
  return { estimate, blockMessage, cost };
};

type CheckoutShippingEstimateNoticeProps = {
  estimate: ShippingEstimate | null;
  blockMessage: string;
};

/**
 * Под адресом — только то, что мешает или неизвестно: «не возит по адресу»
 * или «цену назовёт курьер». Посчитанная сумма стоит в итоге, как на сайте.
 */
export const CheckoutShippingEstimateNotice = ({
  estimate,
  blockMessage,
}: CheckoutShippingEstimateNoticeProps) => {
  const styles = useCheckoutFormStyles();

  if (!estimate) return null;
  // Товар везёт продавец или курьеры Gitorg — считать нечего.
  if (!estimate.available && estimate.reason === "not_external") return null;
  if (blockMessage) {
    return (
      <Text style={styles.feedbackError} accessibilityRole="alert">
        {blockMessage}
      </Text>
    );
  }
  if (!estimate.available) {
    return (
      <Text style={styles.pickupHint}>
        {CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_UNAVAILABLE}
      </Text>
    );
  }
  return null;
};
