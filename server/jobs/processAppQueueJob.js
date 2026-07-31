import {
  JOB_EXPIRE_PRODUCT_PROMOTIONS,
  JOB_EXPIRE_STALE_USER_STORIES,
  JOB_PROCESS_INSTALLMENT_CRON,
  JOB_PROCESS_INTRO_AD_CRON,
  JOB_PROCESS_PREMIUM_CRON,
  JOB_PROCESS_SELLER_PERSONAL_CATEGORY_CRON,
  JOB_PROCESS_SITE_HEADER_BANNER_CAMPAIGN_CRON,
  JOB_PURGE_EXPIRED_BUYER_PASSPORT_SHARES,
  JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_CRON,
  JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS,
  JOB_SEND_EMAIL_VERIFICATION,
} from "../queues/queueConstants.js";
import { sendEmailVerificationForUser } from "../services/auth/emailVerification.js";
import { processIntroAdCampaignCronTasks } from "../services/intro-ad/introAdCampaignHelpers.js";
import { processInstallmentCronTasks } from "../utils/installmentHelpers.js";
import { processPremiumCronTasks } from "../utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "../utils/productPromotionHelpers.js";
import { processSellerPersonalCategoryCronTasks } from "../services/seller-personal-category/sellerPersonalCategoryHelpers.js";
import { processSiteHeaderBannerCampaignCronTasks } from "../services/site-header-banner-campaign/siteHeaderBannerCampaignHelpers.js";
import { purgeExpiredBuyerPassportShares } from "../services/passport-vault/index.js";
import {
  processProductPriceMarketStatusCronTasks,
  processProductPriceMarketStatusPeers,
} from "../services/product/refreshProductPriceMarketStatus.js";
import { expireStaleUserStories } from "../utils/userStoryHelpers.js";

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
    default:
      throw new Error(`Unknown BullMQ job: ${job.name}`);
  }
}
