import { Queue } from "bullmq";

import { APP_QUEUE_NAME, DEFAULT_QUEUE_PREFIX } from "./queueConstants.js";
import { getBullMqRedisConnection } from "./redisConnection.js";

/** @type {import('bullmq').Queue | null} */
let appQueue = null;

/** @returns {import('bullmq').Queue | null} */
export function getAppQueue() {
  const connection = getBullMqRedisConnection();
  if (!connection) {
    return null;
  }

  if (!appQueue) {
    appQueue = new Queue(APP_QUEUE_NAME, {
      connection,
      prefix: DEFAULT_QUEUE_PREFIX,
    });
  }

  return appQueue;
}

export async function closeAppQueue() {
  if (!appQueue) {
    return;
  }

  try {
    await appQueue.close();
  } catch (error) {
    console.error("[bullmq] queue close error:", error);
  } finally {
    appQueue = null;
  }
}
