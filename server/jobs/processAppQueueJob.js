import {
  JOB_EXPIRE_PRODUCT_PROMOTIONS,
  JOB_EXPIRE_PRODUCT_FLASH_SALES,
  JOB_EXPIRE_STALE_USER_STORIES,
  JOB_PROCESS_INSTALLMENT_CRON,
  JOB_PROCESS_INTRO_AD_CRON,
  JOB_PROCESS_PREMIUM_CRON,
  JOB_PROCESS_SELLER_PERSONAL_CATEGORY_CRON,
  JOB_PROCESS_SITE_HEADER_BANNER_CAMPAIGN_CRON,
  JOB_PURGE_EXPIRED_BUYER_PASSPORT_SHARES,
  JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_CRON,
  JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS,
  JOB_PROCESS_ONEC_SYNC_CRON,
  JOB_PROCESS_ONEC_COMMERCEML_IMPORT,
  JOB_PROCESS_ANALYTICS_RECONCILIATION,
  JOB_PROCESS_COURIER_STUCK_SHIPMENTS,
  JOB_PROCESS_LOBO_CRON,
  JOB_PROCESS_PRODUCT_BULK_IMPORT,
  JOB_SEND_EMAIL_VERIFICATION,
} from "../queues/queueConstants.js";
import { sendEmailVerificationForUser } from "../services/auth/emailVerification.js";
import { processCourierStuckShipmentCronTasks } from "../services/courier/courierStuckShipmentsCron.js";
import { processLoboCronTasks } from "../services/shipping/lobo/loboStatusSync.js";
import { processIntroAdCampaignCronTasks } from "../services/intro-ad/introAdCampaignHelpers.js";
import { processInstallmentCronTasks } from "../utils/installmentHelpers.js";
import { processPremiumCronTasks } from "../utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "../utils/productPromotionHelpers.js";
import { expireProductFlashSales } from "../services/product/productFlashSaleExpiry.js";
import { processSellerPersonalCategoryCronTasks } from "../services/seller-personal-category/sellerPersonalCategoryHelpers.js";
import { processSiteHeaderBannerCampaignCronTasks } from "../services/site-header-banner-campaign/siteHeaderBannerCampaignHelpers.js";
import { purgeExpiredBuyerPassportShares } from "../services/passport-vault/index.js";
import {
  processProductPriceMarketStatusCronTasks,
  processProductPriceMarketStatusPeers,
} from "../services/product/refreshProductPriceMarketStatus.js";
import { processOneCCronTasks } from "../services/onec/index.js";
import { processOneCImportJob } from "../services/onec/exchange/processOneCImportJob.js";
import { runAnalyticsReconciliation } from "../services/analytics/index.js";
import { expireStaleUserStories } from "../utils/userStoryHelpers.js";
import { processProductBulkImportJob } from "../services/product/bulkImport/processProductBulkImportJob.js";

/**
 * @param {import('bullmq').Job} job
 */
export async function processAppQueueJob(job) {
  switch (job.name) {
    case JOB_SEND_EMAIL_VERIFICATION:
      return sendEmailVerificationForUser(job.data.userId);
    case JOB_EXPIRE_STALE_USER_STORIES:
      return expireStaleUserStories();
    case JOB_PROCESS_INSTALLMENT_CRON:
      return processInstallmentCronTasks();
    case JOB_PROCESS_PREMIUM_CRON:
      return processPremiumCronTasks();
    case JOB_EXPIRE_PRODUCT_PROMOTIONS:
      return expireProductPromotionsAndSendNotifications();
    case JOB_EXPIRE_PRODUCT_FLASH_SALES:
      return expireProductFlashSales();
    case JOB_PROCESS_INTRO_AD_CRON:
      return processIntroAdCampaignCronTasks();
    case JOB_PROCESS_SELLER_PERSONAL_CATEGORY_CRON:
      return processSellerPersonalCategoryCronTasks();
    case JOB_PROCESS_SITE_HEADER_BANNER_CAMPAIGN_CRON:
      return processSiteHeaderBannerCampaignCronTasks();
    case JOB_PURGE_EXPIRED_BUYER_PASSPORT_SHARES:
      return purgeExpiredBuyerPassportShares();
    case JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_CRON:
      return processProductPriceMarketStatusCronTasks();
    case JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS:
      return processProductPriceMarketStatusPeers(job.data.productIds);
    case JOB_PROCESS_ONEC_SYNC_CRON:
      return processOneCCronTasks();
    case JOB_PROCESS_ONEC_COMMERCEML_IMPORT:
      return processOneCImportJob(job.data.jobId);
    case JOB_PROCESS_ANALYTICS_RECONCILIATION:
      return runAnalyticsReconciliation();
    case JOB_PROCESS_COURIER_STUCK_SHIPMENTS:
      return processCourierStuckShipmentCronTasks();
    case JOB_PROCESS_LOBO_CRON:
      return processLoboCronTasks();
    case JOB_PROCESS_PRODUCT_BULK_IMPORT:
      return processProductBulkImportJob(job.data.jobId);
    default:
      throw new Error(`Unknown BullMQ job: ${job.name}`);
  }
}
