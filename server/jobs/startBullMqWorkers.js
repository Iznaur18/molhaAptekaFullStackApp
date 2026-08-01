import { Worker } from "bullmq";

import { getAppQueue } from "../queues/appQueue.js";
import { APP_QUEUE_NAME, DEFAULT_QUEUE_PREFIX } from "../queues/queueConstants.js";
import { getBullMqRedisConnection } from "../queues/redisConnection.js";

import { CRON_JOB_DEFINITIONS } from "./cronJobDefinitions.js";
import { processAppQueueJob } from "./processAppQueueJob.js";
import { shouldRunCronOnThisProcess } from "./shouldRunCronOnThisProcess.js";

const BULLMQ_WORKER_CONCURRENCY = 5;

/** @type {import('bullmq').Worker | null} */
let appWorker = null;

export async function startBullMqWorkers() {
  const connection = getBullMqRedisConnection();
  if (!connection) {
    throw new Error("BullMQ requires REDIS_URL");
  }

  const queue = getAppQueue();
  if (!queue) {
    throw new Error("BullMQ queue is not initialized");
  }

  if (shouldRunCronOnThisProcess()) {
    for (const definition of CRON_JOB_DEFINITIONS) {
      await queue.add(
        definition.name,
        {},
        {
          repeat: { every: definition.intervalMs },
          jobId: `repeat:${definition.name}`,
        },
      );
    }
    console.log(
      `[bullmq] registered ${CRON_JOB_DEFINITIONS.length} repeatable cron jobs`,
    );
  } else {
    console.log("[bullmq] cron schedulers skipped on this process");
  }

  appWorker = new Worker(APP_QUEUE_NAME, processAppQueueJob, {
    connection,
    prefix: DEFAULT_QUEUE_PREFIX,
    concurrency: BULLMQ_WORKER_CONCURRENCY,
  });

  appWorker.on("failed", (job, error) => {
    console.error(`[bullmq] job ${job?.name ?? "unknown"} failed:`, error);
  });

  console.log("[bullmq] worker started");
  return appWorker;
}

export async function closeBullMqWorkers() {
  if (!appWorker) {
    return;
  }

  try {
    await appWorker.close();
  } catch (error) {
    console.error("[bullmq] worker close error:", error);
  } finally {
    appWorker = null;
  }
}
