import { GeoCacheModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

/** Ключ длиннее схемы Mongo не пропустит — режем заранее, а не падаем. */
const GEO_CACHE_KEY_MAX_LENGTH = 600;

/**
 * Значение из кэша или `null`.
 *
 * Сбой Mongo здесь не повод ронять заказ: без кэша просто сходим в сервис.
 *
 * @param {"geocode" | "route"} kind
 * @param {string} key
 */
export async function readGeoCache(kind, key) {
  try {
    const row = await GeoCacheModel.findOne({
      kind,
      key: String(key).slice(0, GEO_CACHE_KEY_MAX_LENGTH),
      expiresAt: { $gt: new Date() },
    })
      .select("value")
      .lean();
    return row?.value ?? null;
  } catch (error) {
    logServerEvent("warn", {
      event: "geo.cache_read_failed",
      kind,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * @param {"geocode" | "route"} kind
 * @param {string} key
 * @param {unknown} value
 * @param {number} ttlMs
 */
export async function writeGeoCache(kind, key, value, ttlMs) {
  try {
    await GeoCacheModel.updateOne(
      { kind, key: String(key).slice(0, GEO_CACHE_KEY_MAX_LENGTH) },
      { $set: { value, expiresAt: new Date(Date.now() + ttlMs) } },
      { upsert: true },
    );
  } catch (error) {
    logServerEvent("warn", {
      event: "geo.cache_write_failed",
      kind,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
