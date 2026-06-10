import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_REJECTED,
  INTRO_AD_PRICE_POINTS,
} from "../../constants/introAdCampaignConstants.js";
import { IntroAdCampaignModel, UserModel } from "../../models/index.js";
import { scheduleIntroAdCampaignAfterApproval } from "./introAdCampaignControllers.js";
import {
  activateNextQueuedIntroAdCampaign,
  notifyIntroAdApproved,
  notifyIntroAdCancelledByStaff,
  notifyIntroAdRejected,
  toIntroAdCampaignPayload,
} from "../../utils/introAdCampaignHelpers.js";
import { releaseLoyaltyPointsReservation } from "../../utils/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../../utils/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { errorRes, successRes } from "../../utils/index.js";

const DEFAULT_MODERATION_LIMIT = 50;

export const getPendingIntroAdCampaignsCountController = async (_req, res) => {
  try {
    const count = await IntroAdCampaignModel.countDocuments({
      status: INTRO_AD_CAMPAIGN_STATUS_PENDING,
    });
    return successRes(res, { count });
  } catch (error) {
    console.error("getPendingIntroAdCampaignsCountController error:", error);
    return errorRes(res, 500, "Не удалось загрузить очередь intro-рекламы");
  }
};

export const getPendingIntroAdCampaignsController = async (req, res) => {
  try {
    const limit = Math.min(
      DEFAULT_MODERATION_LIMIT,
      Math.max(1, Number(req.query.limit) || DEFAULT_MODERATION_LIMIT),
    );

    const rows = await IntroAdCampaignModel.find({
      status: INTRO_AD_CAMPAIGN_STATUS_PENDING,
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    const advertiserIds = [...new Set(rows.map((row) => String(row.advertiserId)))];
    const advertisers = await UserModel.find({ _id: { $in: advertiserIds } })
      .select("userName userSurname userNickname userProfilePhotoUrl")
      .lean();
    const advertiserById = new Map(advertisers.map((row) => [String(row._id), row]));

    const campaigns = rows.map((row) => ({
      ...toIntroAdCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    }));

    return successRes(res, { campaigns });
  } catch (error) {
    console.error("getPendingIntroAdCampaignsController error:", error);
    return errorRes(res, 500, "Не удалось загрузить очередь intro-рекламы");
  }
};

export const approveIntroAdCampaignController = async (req, res) => {
  try {
    const staffUserId = req.userId;
    const { campaignId } = req.params;

    const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
      return errorRes(res, 409, "Заявка уже обработана");
    }

    const saved = await runInTransaction(async (session) =>
      scheduleIntroAdCampaignAfterApproval({
        campaignId,
        approvedByUserId: staffUserId,
        session,
      }),
    );

    await notifyIntroAdApproved(saved);

    return successRes(res, {
      message: "Заявка одобрена",
      campaign: toIntroAdCampaignPayload(saved),
    });
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      return errorRes(
        res,
        409,
        `Недостаточно баллов у рекламодателя. Нужно: ${error.required}, доступно: ${error.available}`,
      );
    }
    console.error("approveIntroAdCampaignController error:", error);
    return errorRes(res, 500, "Не удалось одобрить заявку");
  }
};

export const rejectIntroAdCampaignController = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const reason = String(req.body?.reason ?? "").trim() || null;

    const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
      return errorRes(res, 409, "Заявка уже обработана");
    }

    const now = new Date();
    const amount = Math.ceil(Number(campaign.amountPoints) || INTRO_AD_PRICE_POINTS);
    const userId = String(campaign.advertiserId);

    await runInTransaction(async (session) => {
      await releaseLoyaltyPointsReservation({ userId, amount, session });
      await IntroAdCampaignModel.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: INTRO_AD_CAMPAIGN_STATUS_REJECTED,
            rejectedReason: reason,
            pointsReleasedAt: now,
          },
        },
        withMongoSession({}, session),
      );
    });

    await notifyIntroAdRejected(campaign, reason);

    return successRes(res, { message: "Заявка отклонена. Баллы возвращены." });
  } catch (error) {
    console.error("rejectIntroAdCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отклонить заявку");
  }
};

export const getManagedIntroAdCampaignsController = async (_req, res) => {
  try {
    const rows = await IntroAdCampaignModel.find({
      status: {
        $in: [INTRO_AD_CAMPAIGN_STATUS_ACTIVE, INTRO_AD_CAMPAIGN_STATUS_QUEUED],
      },
    })
      .sort({ status: 1, scheduledStartAt: 1, createdAt: 1 })
      .lean();

    const advertiserIds = [...new Set(rows.map((row) => String(row.advertiserId)))];
    const advertisers = await UserModel.find({ _id: { $in: advertiserIds } })
      .select("userName userSurname userNickname userProfilePhotoUrl")
      .lean();
    const advertiserById = new Map(advertisers.map((row) => [String(row._id), row]));

    const campaigns = rows.map((row) => ({
      ...toIntroAdCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    }));

    return successRes(res, { campaigns });
  } catch (error) {
    console.error("getManagedIntroAdCampaignsController error:", error);
    return errorRes(res, 500, "Не удалось загрузить активные кампании intro-рекламы");
  }
};

export const cancelIntroAdCampaignByStaffController = async (req, res) => {
  try {
    const staffUserId = req.userId;
    const { campaignId } = req.params;

    const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Кампания не найдена");
    }
    if (
      campaign.status !== INTRO_AD_CAMPAIGN_STATUS_ACTIVE &&
      campaign.status !== INTRO_AD_CAMPAIGN_STATUS_QUEUED
    ) {
      return errorRes(res, 409, "Можно снять только активную кампанию или очередь");
    }

    const now = new Date();
    const wasActive = campaign.status === INTRO_AD_CAMPAIGN_STATUS_ACTIVE;

    await runInTransaction(async (session) => {
      await IntroAdCampaignModel.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
            cancelledAt: now,
            cancelledByUserId: staffUserId,
          },
        },
        withMongoSession({}, session),
      );

      if (wasActive) {
        await activateNextQueuedIntroAdCampaign(session);
      }
    });

    await notifyIntroAdCancelledByStaff(campaign);

    return successRes(res, { message: "Кампания снята" });
  } catch (error) {
    console.error("cancelIntroAdCampaignByStaffController error:", error);
    return errorRes(res, 500, "Не удалось снять кампанию");
  }
};
