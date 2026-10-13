import {
  PRODUCT_DELIVERY_CARRIER_SELLER,
  resolveSellerDeliveryTariff,
} from "@molha/api-contract";
import type { CartSellerGroup } from "@izibuy/shared-lib";

export type CartGroupDeliveryHint =
  | { kind: "free" }
  | { kind: "from"; baseFeeRub: number }
  | { kind: "byTariff" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Что известно о цене доставки в строке продавца — ещё до оформления.
 *
 * Возвращает вид подсказки, а не текст: текст собирает экран из своих
 * подписей, а эту функцию можно проверить тестом без UI. `null` — подсказать
 * нечего: доставки нет или везёт не продавец (такие службы в приложении
 * пока не оформляются).
 */
export function resolveCartGroupDeliveryHint(
  group: Pick<CartSellerGroup, "deliveryAvailable" | "deliveryCarrier" | "lines">,
  goodsTotalRub: number,
): CartGroupDeliveryHint | null {
  if (!group?.deliveryAvailable) return null;
  if (group.deliveryCarrier !== PRODUCT_DELIVERY_CARRIER_SELLER) return null;

  const seller = (group.lines ?? [])
    .map((line) => (isRecord(line?.product) ? line.product.productSeller : null))
    .find(isRecord);
  const tariff = resolveSellerDeliveryTariff(seller ?? null);
  const freeByTotal =
    tariff.paid &&
    tariff.freeFromRub > 0 &&
    (Number(goodsTotalRub) || 0) >= tariff.freeFromRub;
  if (!tariff.paid || freeByTotal) return { kind: "free" };
  return tariff.baseFeeRub > 0
    ? { kind: "from", baseFeeRub: tariff.baseFeeRub }
    : { kind: "byTariff" };
}
