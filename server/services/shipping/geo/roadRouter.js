import {
  SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE,
  SELLER_DELIVERY_DISTANCE_SOURCE_ROAD,
  sellerDeliveryDistanceKm,
} from "@molha/api-contract";

import {
  GEO_CACHE_TTL_MS,
  GEO_SHORT_CACHE_TTL_MS,
  OPENROUTESERVICE_DIRECTIONS_URL,
  OSRM_BASE_URLS_DEFAULT,
  ROAD_DETOUR_FACTOR,
  SAME_POINT_KM,
  VALHALLA_BASE_URLS_DEFAULT,
} from "../../../constants/geoRoutingConstants.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { readGeoCache, writeGeoCache } from "./geoCache.js";
import {
  envUrlList,
  fetchGeoJson,
  geoProviderHost,
  isExternalGeoEnabled,
} from "./geoHttp.js";

/**
 * @typedef {{ lat: number; lon: number }} GeoPoint
 * @typedef {{ distanceKm: number; source: string; provider: string }} RoadDistance
 */

/** @param {number} km */
const roundKm = (km) => Math.round(km * 1000) / 1000;

/** @param {GeoPoint} point */
const pointKey = (point) => `${point.lat.toFixed(5)},${point.lon.toFixed(5)}`;

/**
 * @param {string} base
 * @param {GeoPoint} from
 * @param {GeoPoint} to
 */
async function routeWithOsrm(base, from, to) {
  const url = `${base}/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&alternatives=false&steps=false`;
  const json = await fetchGeoJson(url);
  if (json?.code !== "Ok") {
    throw new Error(`OSRM: ${json?.code ?? "пустой ответ"}`);
  }
  const meters = Number(json?.routes?.[0]?.distance);
  if (!Number.isFinite(meters) || meters < 0) {
    throw new Error("OSRM: нет расстояния");
  }
  // Точка может стоять в стороне от дороги — во дворе, в частном секторе.
  // OSRM притягивает её к ближайшей дороге, и этот отрезок в маршрут не
  // входит; добавляем его сами, иначе продавец везёт эти метры бесплатно.
  const snapMeters = (Array.isArray(json?.waypoints) ? json.waypoints : []).reduce(
    (sum, waypoint) => {
      const value = Number(waypoint?.distance);
      return Number.isFinite(value) && value > 0 ? sum + value : sum;
    },
    0,
  );
  return (meters + snapMeters) / 1000;
}

/**
 * @param {string} base
 * @param {GeoPoint} from
 * @param {GeoPoint} to
 */
async function routeWithValhalla(base, from, to) {
  const payload = {
    locations: [
      { lat: from.lat, lon: from.lon },
      { lat: to.lat, lon: to.lon },
    ],
    costing: "auto",
    directions_type: "none",
    units: "kilometers",
  };
  const json = await fetchGeoJson(
    `${base}/route?json=${encodeURIComponent(JSON.stringify(payload))}`,
  );
  const km = Number(json?.trip?.summary?.length);
  if (!Number.isFinite(km) || km < 0) {
    throw new Error("Valhalla: нет расстояния");
  }
  return km;
}

/**
 * @param {string} apiKey
 * @param {GeoPoint} from
 * @param {GeoPoint} to
 */
async function routeWithOpenRouteService(apiKey, from, to) {
  const url = `${OPENROUTESERVICE_DIRECTIONS_URL}?start=${from.lon},${from.lat}&end=${to.lon},${to.lat}`;
  const json = await fetchGeoJson(url, { headers: { Authorization: apiKey } });
  const meters = Number(json?.features?.[0]?.properties?.summary?.distance);
  if (!Number.isFinite(meters) || meters < 0) {
    throw new Error("OpenRouteService: нет расстояния");
  }
  return meters / 1000;
}

/**
 * Маршрутизаторы по порядку опроса.
 *
 * @returns {Array<{ name: string; run: (from: GeoPoint, to: GeoPoint) => Promise<number> }>}
 */
function listRoutingProviders() {
  const providers = [];
  for (const base of envUrlList("ROAD_ROUTING_OSRM_URLS", OSRM_BASE_URLS_DEFAULT)) {
    providers.push({
      name: `osrm:${geoProviderHost(base)}`,
      run: (from, to) => routeWithOsrm(base, from, to),
    });
  }
  for (const base of envUrlList(
    "ROAD_ROUTING_VALHALLA_URLS",
    VALHALLA_BASE_URLS_DEFAULT,
  )) {
    providers.push({
      name: `valhalla:${geoProviderHost(base)}`,
      run: (from, to) => routeWithValhalla(base, from, to),
    });
  }
  const orsKey = process.env.OPENROUTESERVICE_API_KEY?.trim();
  if (orsKey) {
    providers.push({
      name: "openrouteservice",
      run: (from, to) => routeWithOpenRouteService(orsKey, from, to),
    });
  }
  return providers;
}

/**
 * Расстояние по дорогам от точки до точки. Никогда не `null`.
 *
 * Опрашиваем открытые маршрутизаторы по очереди. Если не ответил ни один,
 * берём прямую с поправкой на извилистость дорог и честно помечаем это
 * `estimate`: оставить заказ без суммы доставки хуже, чем посчитать её с
 * погрешностью в десяток процентов.
 *
 * @param {GeoPoint} from
 * @param {GeoPoint} to
 * @returns {Promise<RoadDistance>}
 */
export async function resolveRoadDistanceKm(from, to) {
  const straightKm = sellerDeliveryDistanceKm(from, to);
  if (straightKm === null) {
    throw new Error("resolveRoadDistanceKm: у точки нет координат");
  }
  if (straightKm <= SAME_POINT_KM) {
    return {
      distanceKm: 0,
      source: SELLER_DELIVERY_DISTANCE_SOURCE_ROAD,
      provider: "same_point",
    };
  }

  const key = `${pointKey(from)}|${pointKey(to)}`;
  const cached = await readGeoCache("route", key);
  if (cached && Number.isFinite(Number(cached.distanceKm))) {
    return cached;
  }

  if (isExternalGeoEnabled()) {
    for (const provider of listRoutingProviders()) {
      try {
        const km = await provider.run(from, to);
        /** @type {RoadDistance} */
        const result = {
          // Дорога не бывает короче прямой: меньшее число — ошибка привязки
          // точки к дороге, а не короткий путь.
          distanceKm: roundKm(Math.max(km, straightKm)),
          source: SELLER_DELIVERY_DISTANCE_SOURCE_ROAD,
          provider: provider.name,
        };
        await writeGeoCache("route", key, result, GEO_CACHE_TTL_MS);
        return result;
      } catch (error) {
        logServerEvent("warn", {
          event: "geo.route_provider_failed",
          provider: provider.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /** @type {RoadDistance} */
  const estimate = {
    distanceKm: roundKm(straightKm * ROAD_DETOUR_FACTOR),
    source: SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE,
    provider: "straight_line",
  };
  // Коротко: маршрутизатор мог лежать минуту, застревать на оценке нельзя.
  await writeGeoCache("route", key, estimate, GEO_SHORT_CACHE_TTL_MS);
  logServerEvent("warn", {
    event: "geo.route_estimate_fallback",
    straightKm: roundKm(straightKm),
    distanceKm: estimate.distanceKm,
  });
  return estimate;
}
