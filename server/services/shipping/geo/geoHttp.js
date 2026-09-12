import {
  GEO_HTTP_TIMEOUT_MS,
  GEO_HTTP_USER_AGENT_DEFAULT,
} from "../../../constants/geoRoutingConstants.js";

/**
 * Ходим ли во внешние геосервисы.
 *
 * В тестах — нет, пока тест сам не попросит (`GEO_EXTERNAL_TEST=1` и
 * подменённый fetch): серверный набор не должен зависеть от интернета.
 * На проде выключается `GEO_EXTERNAL_DISABLED=1` — тогда расстояние
 * считается оценкой по прямой.
 */
export function isExternalGeoEnabled() {
  if (process.env.GEO_EXTERNAL_DISABLED === "1") {
    return false;
  }
  if (process.env.NODE_ENV === "test") {
    return process.env.GEO_EXTERNAL_TEST === "1";
  }
  return true;
}

export function geoUserAgent() {
  return process.env.GEO_HTTP_USER_AGENT?.trim() || GEO_HTTP_USER_AGENT_DEFAULT;
}

/**
 * Список адресов из переменной окружения через запятую.
 *
 * Не задана — берём умолчания; задана пустой строкой — провайдер выключен.
 *
 * @param {string} name
 * @param {string[]} defaults
 * @returns {string[]}
 */
export function envUrlList(name, defaults) {
  const raw = process.env[name];
  if (raw === undefined) {
    return defaults;
  }
  return raw
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/**
 * @param {string} name
 * @param {string} fallback
 */
export function envBaseUrl(name, fallback) {
  const raw = process.env[name]?.trim();
  return (raw || fallback).replace(/\/+$/, "");
}

/**
 * GET с таймаутом и заголовками, которых требуют открытые сервисы OSM.
 *
 * @param {string} url
 * @param {{ timeoutMs?: number; headers?: Record<string, string> }} [options]
 */
export async function fetchGeoJson(url, options = {}) {
  const { timeoutMs = GEO_HTTP_TIMEOUT_MS, headers = {} } = options;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ru",
      "User-Agent": geoUserAgent(),
      ...headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Хост для логов: полный адрес провайдера в событии не нужен.
 *
 * @param {string} url
 */
export function geoProviderHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
