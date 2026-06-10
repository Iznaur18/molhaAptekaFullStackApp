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
import { expireStaleUserStories } from "./utils/userStoryHelpers.js";
import { processInstallmentCronTasks } from "./utils/installmentHelpers.js";
import { processPremiumCronTasks } from "./utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "./utils/productPromotionHelpers.js";
import { processIntroAdCampaignCronTasks } from "./utils/introAdCampaignHelpers.js";
import { processSellerPersonalCategoryCronTasks } from "./utils/sellerPersonalCategoryHelpers.js";
import { INSTALLMENT_CRON_INTERVAL_MS } from "./constants/installmentConstants.js";
import { PREMIUM_CRON_INTERVAL_MS } from "./constants/premiumConstants.js";
import { PRODUCT_PROMOTION_CRON_INTERVAL_MS } from "./constants/productPromotionConstants.js";
import { INTRO_AD_CRON_INTERVAL_MS } from "./constants/introAdCampaignConstants.js";
import { SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS } from "./constants/sellerPersonalCategoryConstants.js";

if (!isObjectStorageUploadEnabled()) {
  ensureUploadsDir();
}

const USER_STORY_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

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

    setInterval(() => {
      void expireStaleUserStories().catch((error) => {
        console.error("expireStaleUserStories error:", error);
      });
    }, USER_STORY_CLEANUP_INTERVAL_MS);

    setInterval(() => {
      void processInstallmentCronTasks().catch((error) => {
        console.error("processInstallmentCronTasks error:", error);
      });
    }, INSTALLMENT_CRON_INTERVAL_MS);

    setInterval(() => {
      void processPremiumCronTasks().catch((error) => {
        console.error("processPremiumCronTasks error:", error);
      });
    }, PREMIUM_CRON_INTERVAL_MS);

    setInterval(() => {
      void expireProductPromotionsAndSendNotifications().catch((error) => {
        console.error("expireProductPromotionsAndSendNotifications error:", error);
      });
    }, PRODUCT_PROMOTION_CRON_INTERVAL_MS);

    setInterval(() => {
      void processIntroAdCampaignCronTasks().catch((error) => {
        console.error("processIntroAdCampaignCronTasks error:", error);
      });
    }, INTRO_AD_CRON_INTERVAL_MS);

    setInterval(() => {
      void processSellerPersonalCategoryCronTasks().catch((error) => {
        console.error("processSellerPersonalCategoryCronTasks error:", error);
      });
    }, SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS);

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
