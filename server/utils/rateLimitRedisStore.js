import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

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
      console.error("[rate-limit] Redis error:", error.message);
    });
    await redisClient.connect();

    const prefix = process.env.REDIS_RATE_LIMIT_PREFIX?.trim() || "izibuy:rl:";
    const store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix,
    });
    console.log(`[rate-limit] Redis store enabled (prefix=${prefix})`);
    return store;
  } catch (error) {
    console.error(
      "[rate-limit] Redis unavailable, using in-memory store:",
      error instanceof Error ? error.message : error,
    );
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
    console.error("[rate-limit] Redis quit error:", error);
  } finally {
    redisClient = null;
  }
}
