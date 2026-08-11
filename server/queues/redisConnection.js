import IORedis from "ioredis";

import { isBullMqEnabled } from "./bullMqEnabled.js";
import { formatLogError, logServerEvent } from "../utils/logServerEvent.js";

/** @type {import('ioredis').default | null} */
let sharedConnection = null;

/** @returns {import('ioredis').default | null} */
export function getBullMqRedisConnection() {
  if (!isBullMqEnabled()) {
    return null;
  }

  if (!sharedConnection) {
    const url = process.env.REDIS_URL.trim();
    sharedConnection = new IORedis(url, {
      maxRetriesPerRequest: null,
    });
    sharedConnection.on("error", (error) => {
      logServerEvent("error", {
        event: "bullmq.redis_error",
        ...formatLogError(error),
      });
    });
  }

  return sharedConnection;
}

export async function closeBullMqRedisConnection() {
  if (!sharedConnection) {
    return;
  }

  try {
    await sharedConnection.quit();
  } catch (error) {
    logServerEvent("error", {
      event: "bullmq.redis_quit_failed",
      ...formatLogError(error),
    });
  } finally {
    sharedConnection = null;
  }
}
