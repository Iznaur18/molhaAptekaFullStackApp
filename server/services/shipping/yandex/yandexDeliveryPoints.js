import { yandexDeliveryRequest } from "./yandexDeliveryClient.js";

/**
 * Пункты Яндекс Доставки: где покупатель забирает и куда продавец сдаёт.
 *
 * Покупателю показываем только пункты с оплатой картой: товар и доставку он
 * оплачивает при получении (решение 22.09.2026), а пункт без терминала такой
 * заказ не примет — Яндекс ответит validation_error ещё на расчёте.
 */

export const YANDEX_PAYMENT_CARD_ON_RECEIPT = "card_on_receipt";

/**
 * @param {unknown} raw строка `points[]` из `pickup-points/list`
 */
export function readYandexPoint(raw) {
  const row = /** @type {Record<string, any>} */ (raw ?? {});
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  const lat = Number(row.position?.latitude);
  const lon = Number(row.position?.longitude);
  const geoId = Number(row.address?.geoId);
  return {
    id,
    name: String(row.name ?? ""),
    address: String(row.address?.full_address ?? ""),
    city: String(row.address?.locality ?? ""),
    geoId: Number.isFinite(geoId) ? geoId : null,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    instruction: String(row.instruction ?? "").slice(0, 500),
    paymentMethods: Array.isArray(row.payment_methods)
      ? row.payment_methods.map(String)
      : [],
    availableForDropoff: row.available_for_dropoff === true,
  };
}

/**
 * Код населённого пункта Яндекса (geo_id) по названию. Первый вариант — самый
 * вероятный: «Грозный» → Грозный, Чеченская Республика, а не хутор в Адыгее.
 *
 * @param {{ token: string; environment?: string }} credentials
 * @param {string} city
 * @returns {Promise<number | null>}
 */
export async function detectYandexGeoId(credentials, city) {
  const text = String(city ?? "").trim();
  if (!text) return null;
  const payload = await yandexDeliveryRequest(credentials, {
    path: "/location/detect",
    body: { location: text },
  });
  const first = /** @type {any} */ (payload)?.variants?.[0];
  const geoId = Number(first?.geo_id);
  return Number.isFinite(geoId) ? geoId : null;
}

/**
 * @param {{ token: string; environment?: string }} credentials
 * @param {{ geoId: number; purpose: "handout" | "dropoff" }} params
 */
export async function listYandexPoints(credentials, { geoId, purpose }) {
  const payload = await yandexDeliveryRequest(credentials, {
    path: "/pickup-points/list",
    body:
      purpose === "dropoff"
        ? { geo_id: geoId, available_for_dropoff: true }
        : {
            geo_id: geoId,
            type: "pickup_point",
            payment_method: YANDEX_PAYMENT_CARD_ON_RECEIPT,
          },
  });
  const rows = Array.isArray(/** @type {any} */ (payload)?.points)
    ? /** @type {any} */ (payload).points
    : [];
  return rows.map(readYandexPoint).filter((point) => point !== null);
}

/**
 * Один пункт по id: при оформлении проверяем, что выбранный пункт ещё жив.
 *
 * @param {{ token: string; environment?: string }} credentials
 * @param {string} pointId
 */
export async function findYandexPoint(credentials, pointId) {
  const payload = await yandexDeliveryRequest(credentials, {
    path: "/pickup-points/list",
    body: { pickup_point_ids: [pointId] },
  });
  const rows = Array.isArray(/** @type {any} */ (payload)?.points)
    ? /** @type {any} */ (payload).points
    : [];
  return rows.map(readYandexPoint).find((point) => point?.id === pointId) ?? null;
}
