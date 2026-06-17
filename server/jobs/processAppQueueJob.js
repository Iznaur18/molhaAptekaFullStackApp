import {
  JOB_EXPIRE_PRODUCT_PROMOTIONS,
  JOB_EXPIRE_STALE_USER_STORIES,
  JOB_PROCESS_INSTALLMENT_CRON,
  JOB_PROCESS_INTRO_AD_CRON,
  JOB_PROCESS_PREMIUM_CRON,
  JOB_PROCESS_SELLER_PERSONAL_CATEGORY_CRON,
  JOB_SEND_EMAIL_VERIFICATION,
} from "../queues/queueConstants.js";
import { sendEmailVerificationForUser } from "../services/auth/emailVerification.js";
import { processIntroAdCampaignCronTasks } from "../services/intro-ad/introAdCampaignHelpers.js";
import { processInstallmentCronTasks } from "../utils/installmentHelpers.js";
import { processPremiumCronTasks } from "../utils/premiumAccess.js";
import { expireProductPromotionsAndSendNotifications } from "../utils/productPromotionHelpers.js";
import { processSellerPersonalCategoryCronTasks } from "../services/seller-personal-category/sellerPersonalCategoryHelpers.js";
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
    default:
      throw new Error(`Unknown BullMQ job: ${job.name}`);
  }
}
