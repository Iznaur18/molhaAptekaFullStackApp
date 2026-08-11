import "dotenv/config";
import "./instrument.js";
import mongoose from "mongoose";

import { initRateLimitMiddlewares } from "./middlewares/rateLimitMW.js";
import { createApp } from "./createApp.js";
import {
  closeRateLimitRedisStore,
  initRateLimitRedisStore,
} from "./utils/rateLimitRedisStore.js";
import { assertProductionEnv } from "./utils/assertProductionEnv.js";
import { isObjectStorageUploadEnabled } from "./utils/objectStorageUpload.js";
import { ensureUploadsDir } from "./utils/uploadsDir.js";
import { connectMongoRead, closeMongoRead } from "./db/mongoReadConnection.js";
import { syncCriticalIndexes } from "./db/syncCriticalIndexes.js";
import { startCronIntervals } from "./jobs/startCronIntervals.js";
import { isBullMqEnabled } from "./queues/bullMqEnabled.js";
import { formatLogError, logServerEvent } from "./utils/logServerEvent.js";

if (!isObjectStorageUploadEnabled()) {
  ensureUploadsDir();
}

if (!process.env.JWT_SECRET) {
  logServerEvent("fatal", {
    event: "api.env_invalid",
    message: "JWT_SECRET не задан в .env",
  });
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  logServerEvent("fatal", {
    event: "api.env_invalid",
    message: "MONGO_URI не задан в .env",
  });
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const { ok, errors, warnings } = assertProductionEnv();
  for (const message of warnings) {
    logServerEvent("warn", {
      event: "api.prod_env_warning",
      message,
    });
  }
  if (!ok) {
    for (const message of errors) {
      logServerEvent("error", {
        event: "api.prod_env_invalid",
        message,
      });
    }
    process.exit(1);
  }
} else if (!process.env.FRONTEND_URL) {
  logServerEvent("warn", {
    event: "api.cors_open_dev",
    message:
      "FRONTEND_URL не задан — CORS разрешён для всех origin (только для dev)",
  });
}

const app = createApp();
const PORT = process.env.PORT ?? 4444;

/** Мягкое время на дренаж соединений перед принудительным выходом. */
const SHUTDOWN_FORCE_EXIT_MS = 10_000;

/** @type {import('node:http').Server | null} */
let httpServer = null;
let isShuttingDown = false;

/**
 * Graceful shutdown: перестаём принимать новые запросы, дренируем текущие,
 * закрываем соединения (Mongo write/read, Redis rate-limit), затем выходим.
 * Критично под нагрузкой: при деплое/рестарте не рвём in-flight запросы.
 *
 * @param {string} signal
 */
async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  logServerEvent("info", {
    event: "api.shutdown_started",
    signal,
  });

  // Подстраховка: если дренаж завис (keep-alive и т.п.) — принудительный выход.
  const forceTimer = setTimeout(() => {
    logServerEvent("fatal", {
      event: "api.shutdown_force_exit",
      message: "таймаут дренажа — принудительный выход",
    });
    process.exit(1);
  }, SHUTDOWN_FORCE_EXIT_MS);
  forceTimer.unref();

  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(() => resolve(undefined)));
    }
    await Promise.allSettled([
      mongoose.disconnect(),
      closeMongoRead(),
      closeRateLimitRedisStore(),
    ]);
    logServerEvent("info", { event: "api.shutdown_complete" });
    clearTimeout(forceTimer);
    process.exit(0);
  } catch (error) {
    logServerEvent("fatal", {
      event: "api.shutdown_failed",
      ...formatLogError(error),
    });
    process.exit(1);
  }
}

async function start() {
  try {
    const rateLimitStore = await initRateLimitRedisStore();
    initRateLimitMiddlewares(rateLimitStore ?? undefined);

    await mongoose.connect(process.env.MONGO_URI);
    logServerEvent("info", { event: "api.mongo_connected" });

    await syncCriticalIndexes();

    await connectMongoRead();

    const cronStarted = startCronIntervals();
    if (isProduction && !cronStarted && !isBullMqEnabled()) {
      logServerEvent("warn", {
        event: "api.cron_not_running",
        message:
          "scheduled-задачи НЕ запущены на этом процессе — нужен worker.js или CRON_LEADER=true",
      });
    }

    httpServer = app.listen(PORT, () => {
      logServerEvent("info", {
        event: "api.listening",
        port: Number(PORT),
      });
    });
    httpServer.on("error", (err) => {
      logServerEvent("fatal", {
        event: "api.listen_failed",
        ...formatLogError(err),
      });
      process.exit(1);
    });

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (err) {
    logServerEvent("fatal", {
      event: "api.startup_failed",
      ...formatLogError(err),
    });
    process.exit(1);
  }
}

void start();
