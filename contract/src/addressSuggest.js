import { z } from "zod";

import { ADDRESS_LINE_MAX_LENGTH } from "./userFields.js";

export const addressSuggestBodySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, `query от 2 до ${ADDRESS_LINE_MAX_LENGTH} символов`)
    .max(ADDRESS_LINE_MAX_LENGTH, `query от 2 до ${ADDRESS_LINE_MAX_LENGTH} символов`),
});

/**
 * @param {Record<string, unknown> | null | undefined} data
 * @param {string} key
 */
function dadataField(data, key) {
  const raw = data?.[key];
  if (raw == null) return "";
  return String(raw).trim();
}

/**
 * Идентификатор конкретного объекта: дом или участок.
 *
 * У участка `house_fias_id` приходит пустой строкой, а не отсутствует, поэтому
 * берём первый непустой из двух, а не `??`.
 *
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {string}
 */
export function dadataSuggestionObjectFiasId(data) {
  return (
    [dadataField(data, "house_fias_id"), dadataField(data, "stead_fias_id")].find(
      (value) => value.length > 0,
    ) ?? ""
  );
}

/**
 * DaData разобрала номер дома (или участка), даже если объекта нет в ФИАС.
 *
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {boolean}
 */
export function hasDadataSuggestionHouseNumber(data) {
  return (
    dadataField(data, "house").length > 0 || dadataField(data, "stead").length > 0
  );
}

/**
 * Координаты подсказки. `Number(null)` и `Number("")` дают 0, поэтому пустое
 * значение отсекаем явно — иначе адрес уезжает в Гвинейский залив.
 *
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {{ lat: number, lon: number } | null}
 */
export function dadataSuggestionGeo(data) {
  const rawLat = data?.geo_lat;
  const rawLon = data?.geo_lon;
  if (rawLat == null || rawLat === "" || rawLon == null || rawLon === "") {
    return null;
  }
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon };
}

/**
 * Подсказка, по которой можно взять координаты адреса.
 *
 * Сначала объект из ФИАС (дом или участок) — у него координаты точные. Если в
 * реестре дома нет, `house_fias_id` пустой, хотя DaData разобрала номер дома и
 * вернула координаты улицы: так выглядит, например, «г Грозный, р-н
 * Ахматовский, ул Субры Кишиевой, д 56». Раньше такие адреса координат не
 * получали вовсе — продавец не мог выбрать собственный адрес точкой отправления
 * и упирался в «Укажите точку на карте или выберите адрес из подсказки».
 * Подсказку без разобранного дома по-прежнему не берём: это центр улицы или
 * города, прилипший к произвольной строке.
 *
 * @template {{ value?: unknown; data?: unknown }} T
 * @param {T[] | null | undefined} suggestions
 * @returns {T | null}
 */
export function pickAddressSuggestionForGeo(suggestions) {
  if (!Array.isArray(suggestions)) {
    return null;
  }

  const withHouseNumber = [];
  for (const item of suggestions) {
    const data = item?.data;
    if (dadataSuggestionObjectFiasId(data).length > 0) {
      return item;
    }
    if (hasDadataSuggestionHouseNumber(data) && dadataSuggestionGeo(data)) {
      withHouseNumber.push(item);
    }
  }

  return withHouseNumber[0] ?? null;
}
