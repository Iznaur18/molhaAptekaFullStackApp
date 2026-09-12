import { normalizeGeoCoord } from "@molha/api-contract";

import {
  GEO_CACHE_TTL_MS,
  GEO_PRECISION_HOUSE,
  GEO_PRECISION_REGION,
  GEO_PRECISION_SETTLEMENT,
  GEO_PRECISION_STREET,
  GEO_SHORT_CACHE_TTL_MS,
  NOMINATIM_BASE_URL_DEFAULT,
  NOMINATIM_MIN_INTERVAL_MS_DEFAULT,
  PHOTON_BASE_URL_DEFAULT,
} from "../../../constants/geoRoutingConstants.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import {
  buildCoarseAddressQueries,
  cleanAddressForOsm,
  extractHouseNumber,
  houseNumbersMatch,
} from "./addressQueries.js";
import { readGeoCache, writeGeoCache } from "./geoCache.js";
import { envBaseUrl, fetchGeoJson, isExternalGeoEnabled } from "./geoHttp.js";

/**
 * Поиск адреса в OpenStreetMap — когда DaData не дала координат или дала
 * только улицу.
 *
 * @typedef {{
 *   point: { lat: number; lon: number };
 *   precision: string;
 *   provider: string;
 * }} GeoCandidate
 */

const PRECISION_RANK = {
  [GEO_PRECISION_HOUSE]: 4,
  [GEO_PRECISION_STREET]: 3,
  [GEO_PRECISION_SETTLEMENT]: 2,
  [GEO_PRECISION_REGION]: 1,
};

/**
 * @param {string | null | undefined} precision
 */
export function geoPrecisionRank(precision) {
  return PRECISION_RANK[String(precision ?? "")] ?? 0;
}

let nominatimQueue = Promise.resolve();
let nominatimLastCallAt = 0;

function nominatimIntervalMs() {
  const raw = process.env.GEO_NOMINATIM_INTERVAL_MS;
  const value = raw === undefined || raw === "" ? NaN : Number(raw);
  return Number.isFinite(value) && value >= 0
    ? value
    : NOMINATIM_MIN_INTERVAL_MS_DEFAULT;
}

/**
 * Очередь к Nominatim: правило сервиса — не чаще раза в секунду, иначе бан.
 *
 * @template T
 * @param {() => Promise<T>} task
 * @returns {Promise<T>}
 */
function scheduleNominatim(task) {
  const run = nominatimQueue.then(async () => {
    const waitMs = nominatimLastCallAt + nominatimIntervalMs() - Date.now();
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    nominatimLastCallAt = Date.now();
    return task();
  });
  nominatimQueue = run.catch(() => undefined);
  return run;
}

/**
 * `place_rank` Nominatim: 30–28 — дом или объект, 27–26 — улица, 25–13 —
 * населённый пункт и его части, меньше — регион и крупнее.
 *
 * @param {Record<string, unknown> | null | undefined} row
 */
function nominatimPrecision(row) {
  const rank = Number(row?.place_rank);
  if (rank >= 28) return GEO_PRECISION_HOUSE;
  if (rank >= 26) return GEO_PRECISION_STREET;
  if (rank >= 13) return GEO_PRECISION_SETTLEMENT;
  return GEO_PRECISION_REGION;
}

/**
 * @param {Record<string, string>} params
 * @returns {Promise<GeoCandidate | null>}
 */
async function searchNominatim(params) {
  const base = envBaseUrl("GEO_NOMINATIM_URL", NOMINATIM_BASE_URL_DEFAULT);
  const search = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    countrycodes: "ru",
    "accept-language": "ru",
    ...params,
  });
  const rows = await scheduleNominatim(() =>
    fetchGeoJson(`${base}/search?${search.toString()}`),
  );
  const row = Array.isArray(rows) ? rows[0] : null;
  const lat = normalizeGeoCoord(row?.lat);
  const lon = normalizeGeoCoord(row?.lon);
  if (lat === null || lon === null) {
    return null;
  }
  return {
    point: { lat, lon },
    precision: nominatimPrecision(row),
    provider: "nominatim",
  };
}

const STREET_TYPE_WORDS = new Set([
  "улица",
  "проспект",
  "переулок",
  "бульвар",
  "шоссе",
  "площадь",
  "набережная",
  "микрорайон",
  "проезд",
  "тупик",
  "аллея",
  "квартал",
]);

/**
 * Та ли это улица: хотя бы одно значимое слово её названия есть в запросе.
 *
 * Photon ищет нечётко и на улицу, которой нет, охотно отдаёт похожую в
 * другом конце города. Проверено вживую: «ул Несуществующая» в Грозном
 * «нашлась» в пяти километрах. Такой ответ хуже центра города — он выглядит
 * точным.
 *
 * @param {string} query
 * @param {unknown} streetName
 */
export function streetNameMatchesQuery(query, streetName) {
  const words = String(streetName ?? "")
    .toLowerCase()
    .replace(/ё/gu, "е")
    .split(/[^a-zа-я0-9-]+/u)
    .filter((word) => word.length >= 3 && !STREET_TYPE_WORDS.has(word));
  if (words.length === 0) {
    return false;
  }
  const haystack = String(query ?? "")
    .toLowerCase()
    .replace(/ё/gu, "е");
  return words.some((word) => haystack.includes(word));
}

/**
 * Точность ответа Photon или `null`, если это явно не тот адрес.
 *
 * @param {Record<string, unknown> | null | undefined} properties
 * @param {string} requestedHouse
 * @param {string} query
 * @returns {string | null}
 */
function photonPrecision(properties, requestedHouse, query) {
  const type = String(properties?.type ?? "");
  if (type === "house") {
    if (!streetNameMatchesQuery(query, properties?.street)) {
      return null;
    }
    return requestedHouse && houseNumbersMatch(requestedHouse, properties?.housenumber)
      ? GEO_PRECISION_HOUSE
      : GEO_PRECISION_STREET;
  }
  if (type === "street") {
    return streetNameMatchesQuery(query, properties?.name)
      ? GEO_PRECISION_STREET
      : null;
  }
  if (type === "county" || type === "state" || type === "country") {
    return GEO_PRECISION_REGION;
  }
  return GEO_PRECISION_SETTLEMENT;
}

/**
 * @param {string} query
 * @param {string} requestedHouse
 * @returns {Promise<GeoCandidate | null>}
 */
async function searchPhoton(query, requestedHouse) {
  const base = envBaseUrl("GEO_PHOTON_URL", PHOTON_BASE_URL_DEFAULT);
  const search = new URLSearchParams({ q: query, limit: "5" });
  const json = await fetchGeoJson(`${base}/api/?${search.toString()}`);
  const features = Array.isArray(json?.features) ? json.features : [];
  for (const feature of features) {
    // Photon ищет по всему миру: «Мира 19» найдётся и в Казахстане.
    if (String(feature?.properties?.countrycode ?? "").toUpperCase() !== "RU") {
      continue;
    }
    const coordinates = Array.isArray(feature?.geometry?.coordinates)
      ? feature.geometry.coordinates
      : [];
    const lat = normalizeGeoCoord(coordinates[1]);
    const lon = normalizeGeoCoord(coordinates[0]);
    const precision = photonPrecision(feature.properties, requestedHouse, query);
    if (lat !== null && lon !== null && precision) {
      return { point: { lat, lon }, precision, provider: "photon" };
    }
  }
  return null;
}

/**
 * Ответ из кэша или из сервиса.
 *
 * «Не нашлось» кэшируем коротко: адрес мог появиться в OSM, а повторный
 * пересчёт корзины не должен каждый раз ждать очереди Nominatim. Сетевую
 * ошибку не кэшируем вовсе — её пробрасываем.
 *
 * @param {string} cacheKey
 * @param {() => Promise<GeoCandidate | null>} lookup
 * @returns {Promise<GeoCandidate | null>}
 */
async function cachedLookup(cacheKey, lookup) {
  const key = cacheKey.toLowerCase();
  const cached = await readGeoCache("geocode", key);
  if (cached) {
    return cached.none ? null : cached;
  }
  const found = await lookup();
  await writeGeoCache(
    "geocode",
    key,
    found ?? { none: true },
    found ? GEO_CACHE_TTL_MS : GEO_SHORT_CACHE_TTL_MS,
  );
  return found;
}

/**
 * @param {Array<{ name: string; run: () => Promise<GeoCandidate | null> }>} lookups
 * @param {{ stopOnFirst?: boolean }} [options]
 * @returns {Promise<GeoCandidate | null>}
 */
async function tryLookups(lookups, options = {}) {
  /** @type {GeoCandidate | null} */
  let best = null;
  for (const { name, run } of lookups) {
    try {
      const candidate = await run();
      if (
        candidate &&
        geoPrecisionRank(candidate.precision) > geoPrecisionRank(best?.precision)
      ) {
        best = candidate;
      }
    } catch (error) {
      logServerEvent("warn", {
        event: "geo.geocode_provider_failed",
        provider: name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    if (best && (options.stopOnFirst || best.precision === GEO_PRECISION_HOUSE)) {
      break;
    }
  }
  return best;
}

/**
 * Точка адреса по OSM — самая точная из найденных.
 *
 * @param {{ line: string; city?: string; street?: string; house?: string }} input
 * @returns {Promise<GeoCandidate | null>}
 */
export async function geocodeAddressWithOsm({
  line,
  city = "",
  street = "",
  house = "",
}) {
  if (!isExternalGeoEnabled()) {
    return null;
  }
  const query = cleanAddressForOsm(line);
  const requestedHouse = String(house || extractHouseNumber(line)).trim();
  const cityName = String(city ?? "").trim();
  const streetName = String(street ?? "").trim();

  const lookups = [];
  // Структурный поиск точнее свободного: Nominatim не гадает, где в строке
  // город, а где улица.
  if (cityName && streetName && requestedHouse) {
    lookups.push({
      name: "nominatim-structured",
      run: () =>
        cachedLookup(
          `nominatim-structured:${cityName}|${streetName}|${requestedHouse}`,
          () =>
            searchNominatim({
              city: cityName,
              street: `${requestedHouse} ${streetName}`,
            }),
        ),
    });
  }
  if (query) {
    lookups.push({
      name: "nominatim",
      run: () =>
        cachedLookup(`nominatim:${query}`, () => searchNominatim({ q: query })),
    });
    lookups.push({
      name: "photon",
      run: () =>
        cachedLookup(`photon:${query}|${requestedHouse}`, () =>
          searchPhoton(query, requestedHouse),
        ),
    });
  }
  return tryLookups(lookups);
}

/**
 * Грубая точка: улица, если не нашёлся дом; город, если не нашлась улица.
 *
 * @param {string} line
 * @returns {Promise<GeoCandidate | null>}
 */
export async function geocodeCoarseWithOsm(line) {
  if (!isExternalGeoEnabled()) {
    return null;
  }
  for (const query of buildCoarseAddressQueries(cleanAddressForOsm(line))) {
    const found = await tryLookups(
      [
        {
          name: "nominatim",
          run: () =>
            cachedLookup(`nominatim:${query}`, () => searchNominatim({ q: query })),
        },
        {
          name: "photon",
          run: () => cachedLookup(`photon:${query}|`, () => searchPhoton(query, "")),
        },
      ],
      { stopOnFirst: true },
    );
    if (found) {
      return found;
    }
  }
  return null;
}
