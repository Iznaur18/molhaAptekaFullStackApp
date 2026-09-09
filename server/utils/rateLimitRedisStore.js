import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";
import { logServerEvent } from "../utils/logServerEvent.js";

/** @type {import('redis').RedisClientType | null} */
let redisClient = null;

/**
 * Фабрика store'ов, а НЕ один общий store.
 *
 * express-rate-limit запрещает делить один экземпляр Store между лимитерами
 * (`ERR_ERL_STORE_REUSE`): у `RedisStore` ключ — это `prefix + key(req)`, и на
 * общем префиксе все ~20 лимитеров пишут в один счётчик. Тогда самый строгий
 * лимит срабатывает от запросов ко всем остальным маршрутам сразу, а окно
 * задаёт тот лимитер, который проинициализировался последним. С memory-store
 * этого не видно (там `rateLimit()` заводит свой store), поэтому проблема
 * вылезла только при включении Redis на проде 09.09.2026.
 *
 * @returns {Promise<((limiterName: string) => import('express-rate-limit').Store) | null>}
 */
export async function initRateLimitRedisStore() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    return null;
  }

  try {
    redisClient = createClient({ url });
    redisClient.on("error", (error) => {
      logServerEvent("error", {
        event: "rate_limit_redis_error",
        error: error instanceof Error ? error.message : String(error),
      });
    });
    await redisClient.connect();

    const prefix = process.env.REDIS_RATE_LIMIT_PREFIX?.trim() || "izibuy:rl:";
    logServerEvent("info", {
      event: "rate_limit_redis_enabled",
      prefix,
    });
    return (limiterName) =>
      new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: `${prefix}${limiterName}:`,
      });
  } catch (error) {
    logServerEvent("warn", {
      event: "rate_limit_redis_unavailable",
      error: error instanceof Error ? error.message : String(error),
    });
    redisClient = null;
    return null;
  }
}

export function isRateLimitRedisEnabled() {
  return redisClient?.isOpen === true;
}

export async function closeRateLimitRedisStore() {
  if (!redisClient?.isOpen) {
    return;
  }
  try {
    await redisClient.quit();
  } catch (error) {
    logServerEvent("error", {
      event: "redis_quit",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    redisClient = null;
  }
}
