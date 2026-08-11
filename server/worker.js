import "dotenv/config";
import "./instrument.js";
import mongoose from "mongoose";

import { startBullMqWorkers, closeBullMqWorkers } from "./jobs/startBullMqWorkers.js";
import { startCronIntervals } from "./jobs/startCronIntervals.js";
import { isBullMqEnabled } from "./queues/bullMqEnabled.js";
import { closeAppQueue } from "./queues/appQueue.js";
import { closeBullMqRedisConnection } from "./queues/redisConnection.js";
import { formatLogError, logServerEvent } from "./utils/logServerEvent.js";

process.env.CRON_LEADER = "true";

/** Периодический heartbeat в лог (journalctl) — liveness без HTTP-сервера. */
const WORKER_HEARTBEAT_MS = Math.max(
  60_000,
  Number(process.env.WORKER_HEARTBEAT_MS) || 5 * 60_000,
);
/** @type {ReturnType<typeof setInterval> | null} */
let heartbeatTimer = null;

if (!process.env.MONGO_URI) {
  logServerEvent("fatal", {
    event: "worker.env_invalid",
    message: "MONGO_URI не задан в .env",
  });
  process.exit(1);
}

async function shutdown() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  await closeBullMqWorkers();
  await closeAppQueue();
  await closeBullMqRedisConnection();
  await mongoose.disconnect();
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logServerEvent("info", { event: "worker.mongo_connected" });

    if (isBullMqEnabled()) {
      await startBullMqWorkers();
    } else {
      const started = startCronIntervals();
      if (!started) {
        logServerEvent("fatal", {
          event: "worker.cron_start_failed",
          message: "Worker failed to start cron intervals",
        });
        process.exit(1);
      }
    }

    const mode = isBullMqEnabled() ? "bullmq" : "cron-intervals";
    logServerEvent("info", {
      event: "worker.running",
      mode,
    });

    heartbeatTimer = setInterval(() => {
      const mem = Math.round(process.memoryUsage().rss / 1024 / 1024);
      logServerEvent("info", {
        event: "worker.heartbeat",
        mode,
        uptimeSec: Math.round(process.uptime()),
        rssMb: mem,
      });
    }, WORKER_HEARTBEAT_MS);
    heartbeatTimer.unref();
  } catch (error) {
    logServerEvent("fatal", {
      event: "worker.startup_failed",
      ...formatLogError(error),
    });
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

void start();
