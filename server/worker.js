import "dotenv/config";
import "./instrument.js";
import mongoose from "mongoose";

import { startBullMqWorkers, closeBullMqWorkers } from "./jobs/startBullMqWorkers.js";
import { startCronIntervals } from "./jobs/startCronIntervals.js";
import { isBullMqEnabled } from "./queues/bullMqEnabled.js";
import { closeAppQueue } from "./queues/appQueue.js";
import { closeBullMqRedisConnection } from "./queues/redisConnection.js";

process.env.CRON_LEADER = "true";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI не задан в .env");
  process.exit(1);
}

async function shutdown() {
  await closeBullMqWorkers();
  await closeAppQueue();
  await closeBullMqRedisConnection();
  await mongoose.disconnect();
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Worker connected to MongoDB");

    if (isBullMqEnabled()) {
      await startBullMqWorkers();
    } else {
      const started = startCronIntervals();
      if (!started) {
        console.error("Worker failed to start cron intervals");
        process.exit(1);
      }
    }

    console.log("Worker running (no HTTP server)");
  } catch (error) {
    console.error("Worker startup error:", error);
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
