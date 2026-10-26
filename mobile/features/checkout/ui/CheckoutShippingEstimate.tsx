import { PRODUCT_DELIVERY_CARRIER_LABEL_RU } from "@molha/api-contract";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import {
  fetchShippingEstimate,
  type ShippingEstimate,
} from "@/entities/cart/api/fetchShippingEstimate";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useCheckoutSellerDeliveryCostStyles } from "@/shared/theme/formChromeStyles";

const CARRIER_LABELS = PRODUCT_DELIVERY_CARRIER_LABEL_RU as Record<string, string>;

/**
 * Примерная цена внешней службы (ЛОБО) — паритет web `CheckoutShippingEstimate`.
 * Неудачный расчёт не мешает оформить заказ: сумму назовёт курьер. Служба не
 * возит по адресу (`blocking`) — оформлять нельзя, форма блокирует кнопку.
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
  return { estimate, blockMessage };
};

type CheckoutShippingEstimateCostProps = {
  estimate: ShippingEstimate | null;
  blockMessage: string;
};

/** Строка «Доставка ЛОБО ≈ N ₽» в итоге: платят курьеру при получении. */
export const CheckoutShippingEstimateCost = ({
  estimate,
  blockMessage,
}: CheckoutShippingEstimateCostProps) => {
  const styles = useCheckoutSellerDeliveryCostStyles();

  if (!estimate) return null;
  // Товар везёт продавец или курьеры Gitorg — считать нечего.
  if (!estimate.available && estimate.reason === "not_external") return null;

  if (blockMessage) {
    return (
      <View style={styles.root}>
        <Text style={[styles.hint, styles.hintError]} accessibilityRole="alert">
          {blockMessage}
        </Text>
      </View>
    );
  }

  if (!estimate.available) {
    return (
      <View style={styles.root}>
        <Text style={styles.hint}>
          {CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_UNAVAILABLE}
        </Text>
      </View>
    );
  }

  const carrier = String(estimate.carrier ?? "");
  const label = CARRIER_LABELS[carrier] ?? carrier;
  const fee = formatPriceRub(Number(estimate.finalCost) || 0);

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.legend}>
          {CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_LABEL(label)}
        </Text>
        <Text style={styles.value}>
          {estimate.approximate ? CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_APPROX(fee) : fee}
        </Text>
      </View>
      <Text style={styles.hint}>{CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_PAY_COURIER}</Text>
    </View>
  );
};
