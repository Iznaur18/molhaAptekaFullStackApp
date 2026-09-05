import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
  INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT,
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_REJECTED,
  INTRO_AD_DURATION_MS,
  INTRO_AD_MAX_ACTIVE,
  INTRO_AD_PRICE_POINTS,
  INTRO_AD_PRICE_RUB,
} from "../../constants/introAdCampaignConstants.js";
import { IntroAdCampaignModel, UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  activateIntroAdCampaignRecord,
  assertNoOpenIntroAdCampaignForAdvertiser,
  countActiveIntroAdCampaigns,
  fillIntroAdActiveSlotsFromQueue,
  notifyIntroAdApproved,
  notifyIntroAdCancelledByStaff,
  notifyIntroAdRejected,
  resolveIntroAdCtaType,
  toIntroAdCampaignPayload,
} from "./introAdCampaignHelpers.js";
import {
} from "../loyalty/loyaltyPointsReserve.js";
import {
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { REFERRAL_SOURCE_KIND_INTRO_AD } from "../../constants/referralConstants.js";
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
export const INTRO_AD_PAID_CANCEL_MESSAGE =
  "Оплаченную кампанию отменяет поддержка — напишите нам";

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
    const { campaign } = await runInTransaction(
      async (session) => {
        await assertNoOpenIntroAdCampaignForAdvertiser(userId, session);


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

        return { campaign };
      },
    );

    return {
      // Деньги не берём и не резервируем: за отклонённую заявку
      // рекламодатель платить не должен.
      message: "Заявка отправлена на модерацию. Счёт придёт после одобрения.",
      campaign: toIntroAdCampaignPayload(campaign.toObject()),
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
    campaign.status !== INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT
  ) {
    // Оплаченную кампанию отменить нельзя, пока нет возврата у провайдера:
    // прежний код возвращал баллы, которых теперь никто не списывал, —
    // это была бы раздача денег из воздуха.
    throw new AppError(409, INTRO_AD_PAID_CANCEL_MESSAGE);
  }

  const now = new Date();

  await runInTransaction(async (session) => {

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
  const activeCount = await countActiveIntroAdCampaigns(session);
  const amount = INTRO_AD_PRICE_POINTS;

  const campaign = await IntroAdCampaignModel.findById(campaignId);
  if (session) {
    campaign?.session(session);
  }
  if (!campaign || campaign.status !== INTRO_AD_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  // Одобрение больше не списывает деньги: оно выставляет счёт. Оплата
  // придёт по СБП, и только она поставит ролик в очередь.
  const ctaType = await resolveIntroAdCtaType(campaign.advertiserId);
  campaign.ctaType = ctaType;
  campaign.approvedByUserId = approvedByUserId;
  campaign.approvedAt = now;
  campaign.status = INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT;
  await campaign.save(withMongoSession({}, session));

  void activeCount;
  void amount;
  return { campaign: campaign.toObject(), cashback: null };
}

/**
 * Кампания, ожидающая оплаты, — для выставления счёта платёжным слоем.
 *
 * @param {string} campaignId
 * @param {string} userId
 */
export async function loadPayableIntroAdCampaign(campaignId, userId) {
  const campaign = await IntroAdCampaignModel.findOne({
    _id: campaignId,
    advertiserId: userId,
    status: INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT,
  }).lean();

  if (!campaign) {
    return null;
  }

  return {
    amountRub: INTRO_AD_PRICE_RUB,
    description: "Реклама на заставке Gitorg",
  };
}

/**
 * Оплата пришла — ставим ролик в очередь и запускаем, если есть слот.
 *
 * @param {string} campaignId
 * @param {string} paymentId
 */
export async function activateIntroAdCampaignAfterPayment(campaignId, paymentId) {
  const now = new Date();

  const { campaign, cashback } = await runInTransaction(async (session) => {
    // Фильтр по статусу — защита от повторного уведомления провайдера.
    const found = await IntroAdCampaignModel.findOneAndUpdate(
      { _id: campaignId, status: INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT },
      {
        $set: {
          status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
          scheduledStartAt: now,
          paidAt: now,
          paymentId,
        },
      },
      { returnDocument: "after", session },
    );

    if (!found) {
      return { campaign: null, cashback: null };
    }

    // Кэшбэк реферала считается от потраченного; баллы и рубли 1:1.
    const credited = await creditReferralCashbackFromSpend({
      spenderUserId: String(found.advertiserId),
      pointsSpent: INTRO_AD_PRICE_RUB,
      sourceKind: REFERRAL_SOURCE_KIND_INTRO_AD,
      sourceId: String(found._id),
      session,
    });

    return { campaign: found, cashback: credited };
  });

  if (!campaign) {
    return null;
  }

  // Свободен слот — крутим сразу, иначе ролик ждёт своей очереди.
  const activeCount = await countActiveIntroAdCampaigns(null);
  if (activeCount < INTRO_AD_MAX_ACTIVE) {
    await activateIntroAdCampaignRecord(campaign._id, null);
  }

  if (cashback?.deferNotification) {
    await notifyReferralCashbackCredited({
      referrerUserId: cashback.referrerUserId,
      amount: cashback.amount,
      spenderUserId: String(campaign.advertiserId),
    });
  }

  return campaign;
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
    const { campaign: saved, cashback } = await runInTransaction(async (session) =>
      scheduleIntroAdCampaignAfterApproval({
        campaignId,
        approvedByUserId: staffUserId,
        session,
      }),
    );

    if (cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: cashback.referrerUserId,
        amount: cashback.amount,
        spenderUserId: String(campaign.advertiserId),
      });
    }

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

  await runInTransaction(async (session) => {
    // Освобождать нечего: за неодобренную заявку деньги не брались.
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
      await fillIntroAdActiveSlotsFromQueue(session);
    }
  });

  await notifyIntroAdCancelledByStaff(campaign);

  return { message: "Кампания снята" };
}
