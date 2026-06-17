import { INSTALLMENT_CRON_INTERVAL_MS } from "../constants/installmentConstants.js";
import { INTRO_AD_CRON_INTERVAL_MS } from "../constants/introAdCampaignConstants.js";
import { PREMIUM_CRON_INTERVAL_MS } from "../constants/premiumConstants.js";
import { PRODUCT_PROMOTION_CRON_INTERVAL_MS } from "../constants/productPromotionConstants.js";
import { SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS } from "../constants/sellerPersonalCategoryConstants.js";
import { expireStaleUserStories } from "../utils/userStoryHelpers.js";
import { processInstallmentCronTasks } from "../utils/installmentHelpers.js";
import { processPremiumCronTasks } from "../utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "../utils/productPromotionHelpers.js";
import { processIntroAdCampaignCronTasks } from "../services/intro-ad/introAdCampaignHelpers.js";
import { processSellerPersonalCategoryCronTasks } from "../services/seller-personal-category/sellerPersonalCategoryHelpers.js";

import { isBullMqEnabled } from "../queues/bullMqEnabled.js";

import { shouldRunCronOnThisProcess } from "./shouldRunCronOnThisProcess.js";

const USER_STORY_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

/** @returns {boolean} */
export function startCronIntervals() {
  if (isBullMqEnabled()) {
    console.log(
      "[cron] skipped — BullMQ repeatable jobs on worker.js (REDIS_URL set)",
    );
    return false;
  }

  if (!shouldRunCronOnThisProcess()) {
    console.log(
      "[cron] skipped on this process (set CRON_LEADER=true on leader or run worker.js)",
    );
    return false;
  }

  console.log("[cron] starting scheduled jobs");

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

  return true;
}
