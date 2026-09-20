import {
  CDEK_CURRENCY_RUB,
  CDEK_ORDER_TYPE_SHOP,
  CDEK_PICKUP_DELIVERY_MODES,
  buildShipmentPackage,
} from "@molha/api-contract";

import { cdekRequest } from "./cdekClient.js";

/**
 * Расчёт доставки СДЭК до пункта выдачи.
 *
 * Вес и габариты берём у товаров; где продавец их не заполнил, подставляется
 * «средняя коробка» платформы, и расчёт возвращает `exact: false` — покупателю
 * такую цену показываем как приблизительную.
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
 * на коробки без схемы упаковки — выдумывать точность, которой нет.
 *
 * Вес и габариты берём у самих товаров; там, где продавец их не заполнил,
 * подставляется «средняя коробка», и вызывающий помечает цену приблизительной.
 *
 * @param {import('@molha/api-contract').ProductShippingFields[]} products
 */
export function buildCdekPackages(products) {
  const box = buildShipmentPackage(products);
  return {
    packages: [
      {
        weight: box.weightG,
        length: box.lengthCm,
        width: box.widthCm,
        height: box.heightCm,
      },
    ],
    exact: box.exact,
  };
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
 *   products: import('@molha/api-contract').ProductShippingFields[];
 * }} params
 * @returns {Promise<{ options: ReturnType<typeof readTariffOption>[]; exact: boolean }>}
 */
export async function quoteCdekPickupTariffs(credentials, { from, to, products }) {
  const fromLocation = buildCdekLocation(from);
  const toLocation = buildCdekLocation(to);
  const { packages, exact } = buildCdekPackages(products);
  if (!fromLocation || !toLocation) {
    // Без обеих точек СДЭК вернёт ошибку; своя проверка даёт понятный текст.
    return { options: [], exact };
  }

  const payload = await cdekRequest(credentials, {
    method: "POST",
    path: "/calculator/tarifflist",
    body: {
      type: CDEK_ORDER_TYPE_SHOP,
      currency: CDEK_CURRENCY_RUB,
      from_location: fromLocation,
      to_location: toLocation,
      packages,
    },
  });

  const rows = Array.isArray(
    /** @type {{ tariff_codes?: unknown[] }} */ (payload)?.tariff_codes,
  )
    ? /** @type {{ tariff_codes: unknown[] }} */ (payload).tariff_codes
    : [];

  const options = rows
    .map(readTariffOption)
    .filter(
      /** @returns {option is NonNullable<ReturnType<typeof readTariffOption>>} */
      (option) =>
        option !== null && CDEK_PICKUP_DELIVERY_MODES.includes(option.deliveryMode),
    )
    .sort((a, b) => a.deliverySumRub - b.deliverySumRub);

  return { options, exact };
}
