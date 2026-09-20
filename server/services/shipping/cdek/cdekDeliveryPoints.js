import { cdekRequest } from "./cdekClient.js";

/**
 * Пункты выдачи СДЭК: справочник, из которого покупатель выбирает, куда везти.
 *
 * Берём только те, где заказ действительно выдают (`is_handout`): в списке
 * СДЭК есть и точки, работающие лишь на приём отправлений.
 */

/**
 * @param {unknown} raw
 */
function readDeliveryPoint(raw) {
  const row = /** @type {Record<string, any>} */ (raw ?? {});
  const code = String(row.code ?? "").trim();
  if (!code) return null;

  const location = row.location ?? {};
  const cityCode = Number(location.city_code);
  const lat = Number(location.latitude);
  const lon = Number(location.longitude);

  return {
    code,
    name: String(row.name ?? ""),
    address: String(location.address_full ?? location.address ?? ""),
    cityCode: Number.isFinite(cityCode) ? cityCode : null,
    city: String(location.city ?? ""),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    workTime: String(row.work_time ?? ""),
    hasCashless: row.have_cashless === true,
  };
}

/**
 * @param {{ account: string; secure: string; environment?: string }} credentials
 * @param {{ cityCode?: number | null; postalCode?: string | null }} params
 */
export async function listCdekDeliveryPoints(credentials, { cityCode, postalCode }) {
  const payload = await cdekRequest(credentials, {
    path: "/deliverypoints",
    query: {
      country_code: "RU",
      type: "PVZ",
      is_handout: true,
      city_code: cityCode ?? undefined,
      postal_code: postalCode ?? undefined,
    },
  });

  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(readDeliveryPoint).filter((point) => point !== null);
}

/**
 * Код города в справочнике СДЭК: без него расчёт и список пунктов промахиваются
 * мимо нужного города, особенно в тёзках вроде двух Первомайских.
 *
 * @param {{ account: string; secure: string; environment?: string }} credentials
 * @param {{ city?: string | null; postalCode?: string | null }} params
 * @returns {Promise<number | null>}
 */
export async function resolveCdekCityCode(credentials, { city, postalCode }) {
  if (!city && !postalCode) return null;

  const payload = await cdekRequest(credentials, {
    path: "/location/cities",
    query: {
      country_codes: "RU",
      city: city ?? undefined,
      postal_code: postalCode ?? undefined,
      size: 1,
    },
  });

  const rows = Array.isArray(payload) ? payload : [];
  const code = Number(/** @type {Record<string, unknown>} */ (rows[0] ?? {}).code);
  return Number.isFinite(code) ? code : null;
}
