import { buildShipmentPackage } from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";

import { yandexDeliveryRequest } from "./yandexDeliveryClient.js";
import { YANDEX_PAYMENT_CARD_ON_RECEIPT } from "./yandexDeliveryPoints.js";

/**
 * Цена Яндекс Доставки до пункта выдачи.
 *
 * `pricing_total` у Яндекса — это всё, что спишут с продавца: доставка плюс
 * комиссия за приём оплаты в пункте (2,2% от суммы товара). Покупателю в
 * пункте выставляем только доставку, комиссию продавец видит отдельно.
 */

/**
 * «3146.38 RUB» → 3146.38.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseYandexMoney(value) {
  const amount = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
}

/**
 * @param {unknown} payload ответ `pricing-calculator`
 */
export function readYandexPricing(payload) {
  const row = /** @type {Record<string, unknown>} */ (payload ?? {});
  const total = parseYandexMoney(row.pricing_total);
  if (total === null) return null;
  const commission =
    parseYandexMoney(row.pricing_commission_on_delivery_payment_amount) ?? 0;
  const days = Number(row.delivery_days);
  return {
    // Округляем вверх до рубля: копейки покупателю не показываем, а округление
    // вниз продавец доплачивал бы из своих.
    deliverySumRub: Math.ceil(Math.max(0, total - commission)),
    paymentCommissionRub: Math.round(commission * 100) / 100,
    totalSellerCostRub: Math.round(total * 100) / 100,
    deliveryDays: Number.isFinite(days) ? days : null,
  };
}

/**
 * @param {Array<{ product: Record<string, unknown>; quantity: number; unitPriceRub: number }>} lines
 */
export function buildYandexPackage(lines) {
  const units = lines.flatMap(({ product, quantity }) =>
    Array.from({ length: Math.max(1, Number(quantity) || 1) }, () => product),
  );
  const pack = buildShipmentPackage(units);
  const itemsTotalRub = lines.reduce(
    (sum, line) =>
      sum + Math.max(0, Number(line.unitPriceRub) || 0) * Math.max(1, line.quantity),
    0,
  );
  return { pack, itemsTotalRub };
}

/**
 * @param {{ token: string; environment?: string }} credentials
 * @param {{
 *   sourceStationId: string;
 *   destinationPointId: string;
 *   lines: Array<{ product: Record<string, unknown>; quantity: number; unitPriceRub: number }>;
 * }} params
 */
export async function quoteYandexToPickupPoint(
  credentials,
  { sourceStationId, destinationPointId, lines },
) {
  const { pack, itemsTotalRub } = buildYandexPackage(lines);
  const kopecks = Math.round(itemsTotalRub * 100);
  const payload = await yandexDeliveryRequest(credentials, {
    path: "/pricing-calculator",
    body: {
      source: { platform_station_id: sourceStationId },
      destination: { platform_station_id: destinationPointId },
      tariff: "self_pickup",
      total_weight: Math.max(1, Math.round(pack.weightG)),
      total_assessed_price: kopecks,
      client_price: kopecks,
      payment_method: YANDEX_PAYMENT_CARD_ON_RECEIPT,
      places: [
        {
          physical_dims: {
            weight_gross: Math.max(1, Math.round(pack.weightG)),
            dx: Math.max(1, Math.round(pack.lengthCm)),
            dy: Math.max(1, Math.round(pack.widthCm)),
            dz: Math.max(1, Math.round(pack.heightCm)),
          },
        },
      ],
    },
  });
  const pricing = readYandexPricing(payload);
  if (!pricing) {
    throw new AppError(502, "Яндекс не посчитал доставку — попробуйте ещё раз");
  }
  return { ...pricing, exact: pack.exact, itemsTotalRub };
}
