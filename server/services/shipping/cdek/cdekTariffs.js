import {
  CDEK_CURRENCY_RUB,
  CDEK_DEFAULT_ITEM_WEIGHT_G,
  CDEK_DEFAULT_PACKAGE_CM,
  CDEK_ORDER_TYPE_SHOP,
  CDEK_PICKUP_DELIVERY_MODES,
} from "@molha/api-contract";

import { cdekRequest } from "./cdekClient.js";

/**
 * Расчёт доставки СДЭК до пункта выдачи.
 *
 * Веса и габаритов у товара пока нет (docs/product/cdek-per-seller-v1.md),
 * поэтому берём значения платформы по умолчанию: лучше показать честную
 * оценку по «средней коробке», чем не показать ничего.
 */

/**
 * @param {{ code?: number | null; postalCode?: string | null; address?: string | null }} location
 * @returns {Record<string, unknown> | null}
 */
export function buildCdekLocation(location) {
  if (location?.code) return { code: location.code };
  if (location?.postalCode) return { postal_code: String(location.postalCode) };
  if (location?.address) return { address: String(location.address) };
  return null;
}

/**
 * Одна посылка на весь заказ: СДЭК считает по суммарному весу, а разбивать
 * на коробки без реальных габаритов — выдумывать точность, которой нет.
 *
 * @param {number} itemCount
 */
export function buildCdekPackages(itemCount) {
  const count = Math.max(1, Math.floor(itemCount) || 1);
  return [
    {
      weight: count * CDEK_DEFAULT_ITEM_WEIGHT_G,
      length: CDEK_DEFAULT_PACKAGE_CM.length,
      width: CDEK_DEFAULT_PACKAGE_CM.width,
      height: CDEK_DEFAULT_PACKAGE_CM.height,
    },
  ];
}

/**
 * @param {unknown} raw
 * @returns {{
 *   tariffCode: number;
 *   tariffName: string;
 *   deliveryMode: number;
 *   deliverySumRub: number;
 *   periodMinDays: number | null;
 *   periodMaxDays: number | null;
 * } | null}
 */
function readTariffOption(raw) {
  const row = /** @type {Record<string, unknown>} */ (raw ?? {});
  const tariffCode = Number(row.tariff_code);
  const deliverySum = Number(row.delivery_sum);
  if (!Number.isFinite(tariffCode) || !Number.isFinite(deliverySum)) {
    return null;
  }
  const periodMin = Number(row.period_min);
  const periodMax = Number(row.period_max);
  return {
    tariffCode,
    tariffName: String(row.tariff_name ?? ""),
    deliveryMode: Number(row.delivery_mode) || 0,
    deliverySumRub: Math.ceil(deliverySum),
    periodMinDays: Number.isFinite(periodMin) ? periodMin : null,
    periodMaxDays: Number.isFinite(periodMax) ? periodMax : null,
  };
}

/**
 * Доступные тарифы до пункта выдачи, от дешёвого к дорогому.
 *
 * @param {{ account: string; secure: string; environment?: string }} credentials
 * @param {{
 *   from: { code?: number | null; postalCode?: string | null; address?: string | null };
 *   to: { code?: number | null; postalCode?: string | null; address?: string | null };
 *   itemCount: number;
 * }} params
 */
export async function quoteCdekPickupTariffs(credentials, { from, to, itemCount }) {
  const fromLocation = buildCdekLocation(from);
  const toLocation = buildCdekLocation(to);
  if (!fromLocation || !toLocation) {
    // Без обеих точек СДЭК вернёт ошибку; своя проверка даёт понятный текст.
    return [];
  }

  const payload = await cdekRequest(credentials, {
    method: "POST",
    path: "/calculator/tarifflist",
    body: {
      type: CDEK_ORDER_TYPE_SHOP,
      currency: CDEK_CURRENCY_RUB,
      from_location: fromLocation,
      to_location: toLocation,
      packages: buildCdekPackages(itemCount),
    },
  });

  const rows = Array.isArray(
    /** @type {{ tariff_codes?: unknown[] }} */ (payload)?.tariff_codes,
  )
    ? /** @type {{ tariff_codes: unknown[] }} */ (payload).tariff_codes
    : [];

  return rows
    .map(readTariffOption)
    .filter(
      /** @returns {option is NonNullable<ReturnType<typeof readTariffOption>>} */
      (option) =>
        option !== null && CDEK_PICKUP_DELIVERY_MODES.includes(option.deliveryMode),
    )
    .sort((a, b) => a.deliverySumRub - b.deliverySumRub);
}
