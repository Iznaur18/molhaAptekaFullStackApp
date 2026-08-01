import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";
import { logServerEvent } from "../utils/logServerEvent.js";

/** @type {import('redis').RedisClientType | null} */
let redisClient = null;

/**
 * @returns {Promise<import('express-rate-limit').Store | null>}
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
    const store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix,
    });
    logServerEvent("info", {
      event: "rate_limit_redis_enabled",
      prefix,
    });
    return store;
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
