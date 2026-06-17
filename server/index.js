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
import { connectMongoRead } from "./db/mongoReadConnection.js";
import { startCronIntervals } from "./jobs/startCronIntervals.js";

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

async function start() {
  try {
    const rateLimitStore = await initRateLimitRedisStore();
    initRateLimitMiddlewares(rateLimitStore ?? undefined);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await connectMongoRead();

    startCronIntervals();

    app
      .listen(PORT, () => {
        console.log(`Сервер успешно запущен на ${PORT}.`);
      })
      .on("error", (err) => {
        console.error("Ошибка запуска сервера:", err);
        process.exit(1);
      });
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

void start();
