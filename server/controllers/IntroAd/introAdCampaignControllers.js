import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_DURATION_MS,
  INTRO_AD_PRICE_POINTS,
} from "../../constants/introAdCampaignConstants.js";
import { IntroAdCampaignModel } from "../../models/index.js";
import {
  activateIntroAdCampaignRecord,
  assertNoOpenIntroAdCampaignForAdvertiser,
  findActiveIntroAdCampaign,
  resolveIntroAdCtaType,
  toIntroAdCampaignPayload,
} from "../../utils/introAdCampaignHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../../utils/loyaltyPointsReserve.js";
import {
  InsufficientLoyaltyPointsError,
  refundLoyaltyPoints,
} from "../../utils/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { errorRes, successRes } from "../../utils/index.js";
import { assertIntroAdMediaUrlsAreUploadedAssets } from "../../utils/validateIntroAdMediaUrls.js";

/**
 * @param {Record<string, unknown>} body
 */
const normalizeIntroAdMediaBody = (body) => {
  const videoMp4Url = String(body.videoMp4Url ?? "").trim();
  if (!videoMp4Url) {
    throw new Error("VIDEO_MP4_REQUIRED");
  }

  const normalizeOptional = (value) => {
    if (value == null || String(value).trim() === "") {
      return null;
    }
    return String(value).trim();
  };

  return {
    videoMp4Url,
    videoWebmUrl: normalizeOptional(body.videoWebmUrl),
    posterUrl: normalizeOptional(body.posterUrl),
    fallbackTitle: String(body.fallbackTitle ?? "").trim(),
    fallbackHint: String(body.fallbackHint ?? "").trim(),
    minMs: body.minMs,
    maxMs: body.maxMs,
    fadeOutMs: body.fadeOutMs,
  };
};

export const getIntroAdConfigController = async (_req, res) => {
  try {
    return successRes(res, {
      pricePoints: INTRO_AD_PRICE_POINTS,
      durationDays: INTRO_AD_DURATION_MS / (24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("getIntroAdConfigController error:", error);
    return errorRes(res, 500, "Не удалось загрузить тариф intro-рекламы");
  }
};

export const getMyIntroAdCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);
    const campaign = await IntroAdCampaignModel.findOne({
      advertiserId: userId,
      status: {
        $in: [
          INTRO_AD_CAMPAIGN_STATUS_PENDING,
          INTRO_AD_CAMPAIGN_STATUS_QUEUED,
          INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
        ],
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    return successRes(res, {
      campaign: campaign ? toIntroAdCampaignPayload(campaign) : null,
      pricePoints: INTRO_AD_PRICE_POINTS,
    });
  } catch (error) {
    console.error("getMyIntroAdCampaignController error:", error);
    return errorRes(res, 500, "Не удалось загрузить заявку intro-рекламы");
  }
};

export const submitIntroAdCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);

    let media;
    try {
      media = normalizeIntroAdMediaBody(req.body ?? {});
      assertIntroAdMediaUrlsAreUploadedAssets(media);
    } catch (error) {
      if (error instanceof Error && error.message === "VIDEO_MP4_REQUIRED") {
        return errorRes(res, 400, "Загрузите MP4-ролик");
      }
      if (error instanceof Error && error.message === "INTRO_AD_MEDIA_URL_INVALID") {
        return errorRes(res, 400, "Используйте файлы, загруженные через сайт");
      }
      throw error;
    }

    const reservedAt = new Date();

    try {
      const { campaign, loyaltyPointsBalance } = await runInTransaction(async (session) => {
        await assertNoOpenIntroAdCampaignForAdvertiser(userId, session);

        const loyaltyPointsBalance = await reserveLoyaltyPoints({
          userId,
          amount: INTRO_AD_PRICE_POINTS,
          session,
        });

        const [campaign] = await IntroAdCampaignModel.create(
          [
            {
              advertiserId: userId,
              status: INTRO_AD_CAMPAIGN_STATUS_PENDING,
              ...media,
              amountPoints: INTRO_AD_PRICE_POINTS,
              pointsReservedAt: reservedAt,
            },
          ],
          withMongoSession({}, session),
        );

        return { campaign, loyaltyPointsBalance };
      });

      return successRes(res, {
        message: "Заявка отправлена на модерацию. Баллы зарезервированы.",
        campaign: toIntroAdCampaignPayload(campaign.toObject()),
        loyaltyPointsBalance: loyaltyPointsBalance ?? null,
      });
    } catch (error) {
      if (error instanceof InsufficientLoyaltyPointsError) {
        return errorRes(
          res,
          409,
          `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
        );
      }
      if (error instanceof Error && error.message === "INTRO_AD_CAMPAIGN_ALREADY_OPEN") {
        return errorRes(res, 409, "У вас уже есть активная заявка или кампания");
      }
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return errorRes(res, 409, "У вас уже есть активная заявка или кампания");
      }
      throw error;
    }
  } catch (error) {
    console.error("submitIntroAdCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отправить заявку intro-рекламы");
  }
};

export const cancelMyIntroAdCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);
    const { campaignId } = req.params;

    const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (String(campaign.advertiserId) !== userId) {
      return errorRes(res, 403, "Можно отменить только свою заявку");
    }
    if (
      campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING &&
      campaign.status !== INTRO_AD_CAMPAIGN_STATUS_QUEUED
    ) {
      return errorRes(res, 409, "Отменить можно только до начала показа");
    }

    const now = new Date();
    const amount = Math.ceil(Number(campaign.amountPoints) || INTRO_AD_PRICE_POINTS);

    await runInTransaction(async (session) => {
      if (campaign.status === INTRO_AD_CAMPAIGN_STATUS_PENDING) {
        await releaseLoyaltyPointsReservation({ userId, amount, session });
      } else if (campaign.pointsChargedAt) {
        await refundLoyaltyPoints({ userId, amount, session });
      }

      await IntroAdCampaignModel.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
            cancelledAt: now,
            cancelledByUserId: userId,
            pointsReleasedAt: now,
          },
        },
        withMongoSession({}, session),
      );
    });

    return successRes(res, {
      message: "Заявка отменена. Баллы возвращены.",
    });
  } catch (error) {
    console.error("cancelMyIntroAdCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отменить заявку");
  }
};

/**
 * @param {{
 *   campaignId: import('mongoose').Types.ObjectId | string;
 *   approvedByUserId: import('mongoose').Types.ObjectId | string;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export const scheduleIntroAdCampaignAfterApproval = async ({
  campaignId,
  approvedByUserId,
  session = null,
}) => {
  const now = new Date();
  const active = await findActiveIntroAdCampaign(session);
  const amount = INTRO_AD_PRICE_POINTS;

  const campaign = await IntroAdCampaignModel.findById(campaignId);
  if (session) {
    campaign?.session(session);
  }
  if (!campaign || campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
    throw new Error("INTRO_AD_CAMPAIGN_NOT_PENDING");
  }

  await chargeReservedLoyaltyPoints({
    userId: String(campaign.advertiserId),
    amount,
    session,
  });

  const ctaType = await resolveIntroAdCtaType(campaign.advertiserId);
  campaign.ctaType = ctaType;
  campaign.pointsChargedAt = now;
  campaign.approvedByUserId = approvedByUserId;

  if (active) {
    campaign.status = INTRO_AD_CAMPAIGN_STATUS_QUEUED;
    campaign.scheduledStartAt = active.activeUntil;
    await campaign.save(withMongoSession({}, session));
    return campaign.toObject();
  }

  campaign.status = INTRO_AD_CAMPAIGN_STATUS_QUEUED;
  campaign.scheduledStartAt = now;
  await campaign.save(withMongoSession({}, session));

  const activated = await activateIntroAdCampaignRecord(campaign._id, session);
  return activated ?? campaign.toObject();
};
