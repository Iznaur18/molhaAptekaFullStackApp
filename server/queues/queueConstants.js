export const DEFAULT_QUEUE_PREFIX =
  process.env.REDIS_BULLMQ_PREFIX?.trim() || "izibuy:mq";

export const APP_QUEUE_NAME = "app";

export const JOB_SEND_EMAIL_VERIFICATION = "sendEmailVerification";
export const JOB_EXPIRE_STALE_USER_STORIES = "expireStaleUserStories";
export const JOB_PROCESS_INSTALLMENT_CRON = "processInstallmentCronTasks";
export const JOB_PROCESS_PREMIUM_CRON = "processPremiumCronTasks";
export const JOB_EXPIRE_PRODUCT_PROMOTIONS = "expireProductPromotions";
export const JOB_EXPIRE_PRODUCT_FLASH_SALES = "expireProductFlashSales";
export const JOB_PROCESS_INTRO_AD_CRON = "processIntroAdCampaignCronTasks";
export const JOB_PROCESS_SELLER_PERSONAL_CATEGORY_CRON =
  "processSellerPersonalCategoryCronTasks";
export const JOB_PROCESS_SITE_HEADER_BANNER_CAMPAIGN_CRON =
  "processSiteHeaderBannerCampaignCronTasks";
export const JOB_PURGE_EXPIRED_BUYER_PASSPORT_SHARES =
  "purgeExpiredBuyerPassportShares";
export const JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_CRON =
  "processProductPriceMarketStatusCronTasks";
export const JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS =
  "processProductPriceMarketStatusPeers";
export const JOB_PROCESS_ONEC_SYNC_CRON = "processOneCSyncCronTasks";
export const JOB_PROCESS_ANALYTICS_RECONCILIATION =
  "processAnalyticsReconciliation";
export const JOB_PROCESS_PRODUCT_BULK_IMPORT = "processProductBulkImport";
