import IORedis from "ioredis";

import { isBullMqEnabled } from "./bullMqEnabled.js";

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
      console.error("[bullmq] Redis error:", error.message);
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
    console.error("[bullmq] Redis quit error:", error);
  } finally {
    sharedConnection = null;
  }
}
