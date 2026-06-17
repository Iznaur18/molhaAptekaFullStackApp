import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_REJECTED,
  INTRO_AD_DURATION_MS,
  INTRO_AD_PRICE_POINTS,
} from "../../constants/introAdCampaignConstants.js";
import { IntroAdCampaignModel, UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  activateIntroAdCampaignRecord,
  activateNextQueuedIntroAdCampaign,
  assertNoOpenIntroAdCampaignForAdvertiser,
  findActiveIntroAdCampaign,
  notifyIntroAdApproved,
  notifyIntroAdCancelledByStaff,
  notifyIntroAdRejected,
  resolveIntroAdCtaType,
  toIntroAdCampaignPayload,
} from "./introAdCampaignHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../loyalty/loyaltyPointsReserve.js";
import {
  InsufficientLoyaltyPointsError,
  refundLoyaltyPoints,
} from "../loyalty/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

import { parseIntroAdMediaBody } from "./introAdCampaignServiceHelpers.js";

const DEFAULT_MODERATION_LIMIT = 50;

export function getIntroAdConfig() {
  return {
    pricePoints: INTRO_AD_PRICE_POINTS,
    durationDays: INTRO_AD_DURATION_MS / (24 * 60 * 60 * 1000),
  };
}

/**
 * @param {{ userId: string }} input
 */
export async function getMyIntroAdCampaign({ userId }) {
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

  return {
    campaign: campaign ? toIntroAdCampaignPayload(campaign) : null,
    pricePoints: INTRO_AD_PRICE_POINTS,
  };
}

/**
 * @param {{
 *   userId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function submitIntroAdCampaign({ userId, body }) {
  const media = parseIntroAdMediaBody(body ?? {});
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

    return {
      message: "Заявка отправлена на модерацию. Баллы зарезервированы.",
      campaign: toIntroAdCampaignPayload(campaign.toObject()),
      loyaltyPointsBalance: loyaltyPointsBalance ?? null,
    };
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    if (error instanceof Error && error.message === "INTRO_AD_CAMPAIGN_ALREADY_OPEN") {
      throw new AppError(409, "У вас уже есть активная заявка или кампания");
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw new AppError(409, "У вас уже есть активная заявка или кампания");
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
export async function cancelMyIntroAdCampaign({ userId, campaignId }) {
  const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (String(campaign.advertiserId) !== userId) {
    throw new AppError(403, "Можно отменить только свою заявку");
  }
  if (
    campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING &&
    campaign.status !== INTRO_AD_CAMPAIGN_STATUS_QUEUED
  ) {
    throw new AppError(409, "Отменить можно только до начала показа");
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

  return { message: "Заявка отменена. Баллы возвращены." };
}

/**
 * @param {{
 *   campaignId: import('mongoose').Types.ObjectId | string;
 *   approvedByUserId: import('mongoose').Types.ObjectId | string;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export async function scheduleIntroAdCampaignAfterApproval({
  campaignId,
  approvedByUserId,
  session = null,
}) {
  const now = new Date();
  const active = await findActiveIntroAdCampaign(session);
  const amount = INTRO_AD_PRICE_POINTS;

  const campaign = await IntroAdCampaignModel.findById(campaignId);
  if (session) {
    campaign?.session(session);
  }
  if (!campaign || campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
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
}

export async function countPendingIntroAdCampaigns() {
  const count = await IntroAdCampaignModel.countDocuments({
    status: INTRO_AD_CAMPAIGN_STATUS_PENDING,
  });

  return { count };
}

/**
 * @param {{ query: Record<string, unknown> }} input
 */
export async function getPendingIntroAdCampaigns({ query }) {
  const limit = Math.min(
    DEFAULT_MODERATION_LIMIT,
    Math.max(1, Number(query.limit) || DEFAULT_MODERATION_LIMIT),
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

  return {
    campaigns: rows.map((row) => ({
      ...toIntroAdCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    })),
  };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function approveIntroAdCampaign({ staffUserId, campaignId }) {
  const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  try {
    const saved = await runInTransaction(async (session) =>
      scheduleIntroAdCampaignAfterApproval({
        campaignId,
        approvedByUserId: staffUserId,
        session,
      }),
    );

    await notifyIntroAdApproved(saved);

    return {
      message: "Заявка одобрена",
      campaign: toIntroAdCampaignPayload(saved),
    };
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов у рекламодателя. Нужно: ${error.required}, доступно: ${error.available}`,
      );
    }
    throw error;
  }
}

/**
 * @param {{
 *   campaignId: string;
 *   reason: unknown;
 * }} input
 */
export async function rejectIntroAdCampaign({ campaignId, reason: rawReason }) {
  const reason = String(rawReason ?? "").trim() || null;

  const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
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

  return { message: "Заявка отклонена. Баллы возвращены." };
}

export async function getManagedIntroAdCampaigns() {
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

  return {
    campaigns: rows.map((row) => ({
      ...toIntroAdCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    })),
  };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function cancelIntroAdCampaignByStaff({ staffUserId, campaignId }) {
  const campaign = await IntroAdCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Кампания не найдена");
  }
  if (
    campaign.status !== INTRO_AD_CAMPAIGN_STATUS_ACTIVE &&
    campaign.status !== INTRO_AD_CAMPAIGN_STATUS_QUEUED
  ) {
    throw new AppError(409, "Можно снять только активную кампанию или очередь");
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

  return { message: "Кампания снята" };
}
