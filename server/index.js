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

if (!isObjectStorageUploadEnabled()) {
  ensureUploadsDir();
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET не задан в .env");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI не задан в .env");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const { ok, errors, warnings } = assertProductionEnv();
  for (const message of warnings) {
    console.warn(`[prod-env] ${message}`);
  }
  if (!ok) {
    for (const message of errors) {
      console.error(`[prod-env] ${message}`);
    }
    process.exit(1);
  }
} else if (!process.env.FRONTEND_URL) {
  console.warn(
    "FRONTEND_URL не задан — CORS разрешён для всех origin (только для dev)",
  );
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
  console.log(`[shutdown] получен ${signal}, завершаемся…`);

  // Подстраховка: если дренаж завис (keep-alive и т.п.) — принудительный выход.
  const forceTimer = setTimeout(() => {
    console.error("[shutdown] таймаут дренажа — принудительный выход");
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
    console.log("[shutdown] соединения закрыты, выходим");
    clearTimeout(forceTimer);
    process.exit(0);
  } catch (error) {
    console.error("[shutdown] ошибка:", error);
    process.exit(1);
  }
}

async function start() {
  try {
    const rateLimitStore = await initRateLimitRedisStore();
    initRateLimitMiddlewares(rateLimitStore ?? undefined);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await syncCriticalIndexes();

    await connectMongoRead();

    const cronStarted = startCronIntervals();
    if (isProduction && !cronStarted && !isBullMqEnabled()) {
      console.warn(
        "[cron] ВНИМАНИЕ: scheduled-задачи (завершение розыгрышей, дедлайны рассрочки, " +
          "истечение промо/баннеров/премиума, чистка сторис) НЕ запущены на этом процессе. " +
          "Убедитесь, что ровно один процесс их выполняет: запустите worker.js или задайте CRON_LEADER=true.",
      );
    }

    httpServer = app.listen(PORT, () => {
      console.log(`Сервер успешно запущен на ${PORT}.`);
    });
    httpServer.on("error", (err) => {
      console.error("Ошибка запуска сервера:", err);
      process.exit(1);
    });

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

void start();
