import { formatLogError, logServerEvent } from "../utils/logServerEvent.js";

import { isBullMqEnabled } from "../queues/bullMqEnabled.js";

import { ONEC_SYNC_INTERVAL_MS } from "../constants/onecConstants.js";
import { INSTALLMENT_CRON_INTERVAL_MS } from "../constants/installmentConstants.js";
import { INTRO_AD_CRON_INTERVAL_MS } from "../constants/introAdCampaignConstants.js";
import { PREMIUM_CRON_INTERVAL_MS } from "../constants/premiumConstants.js";
import { PRODUCT_PROMOTION_CRON_INTERVAL_MS } from "../constants/productPromotionConstants.js";
import { SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS } from "../constants/sellerPersonalCategoryConstants.js";
import { SITE_HEADER_BANNER_CAMPAIGN_CRON_INTERVAL_MS } from "../constants/siteHeaderBannerCampaignConstants.js";
import { PRODUCT_PRICE_MARKET_STATUS_CRON_INTERVAL_MS } from "../constants/productPriceMarketStatusConstants.js";
import { BUYER_PASSPORT_SHARE_PURGE_CRON_INTERVAL_MS } from "../constants/passportVaultConstants.js";
import { expireStaleUserStories } from "../utils/userStoryHelpers.js";
import { processInstallmentCronTasks } from "../utils/installmentHelpers.js";
import { processPremiumCronTasks } from "../utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "../utils/productPromotionHelpers.js";
import { processIntroAdCampaignCronTasks } from "../services/intro-ad/introAdCampaignHelpers.js";
import { processSellerPersonalCategoryCronTasks } from "../services/seller-personal-category/sellerPersonalCategoryHelpers.js";
import { processSiteHeaderBannerCampaignCronTasks } from "../services/site-header-banner-campaign/siteHeaderBannerCampaignHelpers.js";
import { purgeExpiredBuyerPassportShares } from "../services/passport-vault/index.js";
import { processProductPriceMarketStatusCronTasks } from "../services/product/refreshProductPriceMarketStatus.js";
import { processOneCCronTasks } from "../services/onec/index.js";

import { shouldRunCronOnThisProcess } from "./shouldRunCronOnThisProcess.js";

const USER_STORY_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

/**
 * @param {string} job
 * @param {() => Promise<unknown>} run
 */
function scheduleCronJob(job, intervalMs, run) {
  setInterval(() => {
    void run().catch((error) => {
      logServerEvent("error", {
        event: "cron.job_failed",
        job,
        ...formatLogError(error),
      });
    });
  }, intervalMs);
}

/** @returns {boolean} */
export function startCronIntervals() {
  if (isBullMqEnabled()) {
    logServerEvent("info", {
      event: "cron.skipped",
      reason: "bullmq_enabled",
    });
    return false;
  }

  if (!shouldRunCronOnThisProcess()) {
    logServerEvent("info", {
      event: "cron.skipped",
      reason: "not_cron_leader",
    });
    return false;
  }

  logServerEvent("info", { event: "cron.started" });

  scheduleCronJob("expire_stale_user_stories", USER_STORY_CLEANUP_INTERVAL_MS, expireStaleUserStories);
  scheduleCronJob(
    "process_installment_cron_tasks",
    INSTALLMENT_CRON_INTERVAL_MS,
    processInstallmentCronTasks,
  );
  scheduleCronJob(
    "process_premium_cron_tasks",
    PREMIUM_CRON_INTERVAL_MS,
    processPremiumCronTasks,
  );
  scheduleCronJob(
    "expire_product_promotions",
    PRODUCT_PROMOTION_CRON_INTERVAL_MS,
    expireProductPromotionsAndSendNotifications,
  );
  scheduleCronJob(
    "process_intro_ad_campaign_cron_tasks",
    INTRO_AD_CRON_INTERVAL_MS,
    processIntroAdCampaignCronTasks,
  );
  scheduleCronJob(
    "process_seller_personal_category_cron_tasks",
    SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS,
    processSellerPersonalCategoryCronTasks,
  );
  scheduleCronJob(
    "process_site_header_banner_campaign_cron_tasks",
    SITE_HEADER_BANNER_CAMPAIGN_CRON_INTERVAL_MS,
    processSiteHeaderBannerCampaignCronTasks,
  );
  scheduleCronJob(
    "purge_expired_buyer_passport_shares",
    BUYER_PASSPORT_SHARE_PURGE_CRON_INTERVAL_MS,
    purgeExpiredBuyerPassportShares,
  );
  scheduleCronJob(
    "process_product_price_market_status_cron_tasks",
    PRODUCT_PRICE_MARKET_STATUS_CRON_INTERVAL_MS,
    processProductPriceMarketStatusCronTasks,
  );
  scheduleCronJob("process_onec_cron_tasks", ONEC_SYNC_INTERVAL_MS, processOneCCronTasks);

  return true;
}
