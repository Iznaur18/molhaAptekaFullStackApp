import {
  SITE_HEADER_BANNER_CAMPAIGN_OPEN_STATUSES,
  SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
} from "../../constants/siteHeaderBannerCampaignConstants.js";
import { SiteHeaderBannerCampaignModel } from "../../models/SiteHeaderBannerCampaignModel.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertNoOpenSiteHeaderBannerCampaignForAdvertiser,
  getSiteHeaderBannerCampaignConfigPayload,
  toSiteHeaderBannerCampaignPayload,
} from "./siteHeaderBannerCampaignHelpers.js";
import { parseSiteHeaderBannerCampaignSubmitBody } from "./siteHeaderBannerCampaignServiceHelpers.js";
import {
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../loyalty/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../loyalty/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

export async function getSiteHeaderBannerCampaignConfig() {
  return getSiteHeaderBannerCampaignConfigPayload();
}

/**
 * @param {{ userId: string }} input
 */
export async function getMySiteHeaderBannerCampaign({ userId }) {
  const campaign = await SiteHeaderBannerCampaignModel.findOne({
    advertiserId: userId,
    status: { $in: SITE_HEADER_BANNER_CAMPAIGN_OPEN_STATUSES },
  })
    .sort({ createdAt: -1 })
    .lean();

  const config = await getSiteHeaderBannerCampaignConfigPayload();

  return {
    campaign: campaign ? toSiteHeaderBannerCampaignPayload(campaign) : null,
    ...config,
  };
}

/**
 * @param {{
 *   userId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function submitSiteHeaderBannerCampaign({ userId, body }) {
  const payload = parseSiteHeaderBannerCampaignSubmitBody(body);
  const reservedAt = new Date();

  try {
    const { campaign, loyaltyPointsBalance } = await runInTransaction(async (session) => {
      await assertNoOpenSiteHeaderBannerCampaignForAdvertiser(userId, session);

      const loyaltyPointsBalance = await reserveLoyaltyPoints({
        userId,
        amount: SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
        session,
      });

      const [campaign] = await SiteHeaderBannerCampaignModel.create(
        [
          {
            advertiserId: userId,
            status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
            ...payload,
            amountPoints: SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
            pointsReservedAt: reservedAt,
          },
        ],
        withMongoSession({}, session),
      );

      return { campaign, loyaltyPointsBalance };
    });

    return {
      message: "Заявка отправлена на модерацию. Баллы зарезервированы.",
      campaign: toSiteHeaderBannerCampaignPayload(campaign.toObject()),
      loyaltyPointsBalance: loyaltyPointsBalance ?? null,
    };
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    if (
      error instanceof Error &&
      error.message === "SITE_HEADER_BANNER_CAMPAIGN_ALREADY_OPEN"
    ) {
      throw new AppError(409, "У вас уже есть активная заявка или баннер");
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw new AppError(409, "У вас уже есть активная заявка или баннер");
    }
    throw error;
  }
}

/**
 * @param {{
 *   userId: string;
 *   campaignId: string;
 * }} input
 */
export async function cancelMySiteHeaderBannerCampaign({ userId, campaignId }) {
  const campaign = await SiteHeaderBannerCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (String(campaign.advertiserId) !== userId) {
    throw new AppError(403, "Можно отменить только свою заявку");
  }
  if (campaign.status !== SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Отменить можно только до начала показа");
  }

  const now = new Date();
  const amount = Math.ceil(
    Number(campaign.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  );

  await runInTransaction(async (session) => {
    await releaseLoyaltyPointsReservation({ userId, amount, session });

    await SiteHeaderBannerCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
          cancelledAt: now,
          cancelledByUserId: userId,
          pointsReleasedAt: now,
        },
      },
      withMongoSession({}, session),
    );
  });

  return { message: "Заявка отменена. Баллы возвращены." };
}
