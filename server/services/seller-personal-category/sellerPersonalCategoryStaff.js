import {
  SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
  SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  SELLER_PERSONAL_CATEGORY_STATUS_REJECTED,
} from "../../constants/sellerPersonalCategoryConstants.js";
import {
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
  UserModel,
} from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { cleanupReplacedSellerPersonalCategoryImage } from "./cleanupReplacedSellerPersonalCategoryImage.js";
import {
  activateSellerPersonalCategoryCampaign,
  assertSellerPersonalCategorySlotAvailable,
  notifySellerPersonalCategoryApproved,
  notifySellerPersonalCategoryCancelledByStaff,
  notifySellerPersonalCategoryDeletedByStaff,
  notifySellerPersonalCategoryRejected,
  toSellerPersonalCategoryCampaignPayload,
  unlinkSellerProductsFromPersonalCategory,
} from "./sellerPersonalCategoryHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
} from "../loyalty/loyaltyPointsReserve.js";
import { refundLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import { InsufficientLoyaltyPointsError } from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { reverseReferralCashbackForSource } from "../referral/reverseReferralCashbackForSource.js";
import { REFERRAL_SOURCE_KIND_SELLER_PERSONAL_CATEGORY } from "../../constants/referralConstants.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

const DEFAULT_MODERATION_LIMIT = 50;

export async function countPendingSellerPersonalCategoryCampaigns() {
  const count = await SellerPersonalCategoryCampaignModel.countDocuments({
    status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  });

  return { count };
}

/**
 * @param {{ query: Record<string, unknown> }} input
 */
export async function getPendingSellerPersonalCategoryCampaigns({ query }) {
  const limit = Math.min(
    DEFAULT_MODERATION_LIMIT,
    Math.max(1, Number(query.limit) || DEFAULT_MODERATION_LIMIT),
  );

  const rows = await SellerPersonalCategoryCampaignModel.find({
    status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)))];
  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("userName userSurname userNickname userProfilePhotoUrl")
    .lean();
  const sellerById = new Map(sellers.map((row) => [String(row._id), row]));

  return {
    campaigns: rows.map((row) => ({
      ...toSellerPersonalCategoryCampaignPayload(row),
      seller: sellerById.get(String(row.sellerId)) ?? null,
    })),
  };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function approveSellerPersonalCategoryCampaign({
  staffUserId,
  campaignId,
}) {
  const campaign =
    await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  const amount = Math.ceil(Number(campaign.amountPoints) || 0);
  const existingCategory = await SellerPersonalCategoryModel.findOne({
    sellerId: campaign.sellerId,
  })
    .select("imageUrl")
    .lean();

  try {
    const { saved, cashback } = await runInTransaction(async (session) => {
      await assertSellerPersonalCategorySlotAvailable(session);

      await chargeReservedLoyaltyPoints({
        userId: String(campaign.sellerId),
        amount,
        session,
      });

      const cashback = await creditReferralCashbackFromSpend({
        spenderUserId: String(campaign.sellerId),
        pointsSpent: amount,
        sourceKind: REFERRAL_SOURCE_KIND_SELLER_PERSONAL_CATEGORY,
        sourceId: String(campaignId),
        session,
      });

      const activated = await activateSellerPersonalCategoryCampaign({
        campaignId,
        approvedByUserId: staffUserId,
        session,
      });

      await SellerPersonalCategoryCampaignModel.updateOne(
        { _id: campaignId },
        { $set: { pointsChargedAt: new Date() } },
        withMongoSession({}, session),
      );

      return { saved: activated, cashback };
    });

    if (cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: cashback.referrerUserId,
        amount: cashback.amount,
        spenderUserId: String(campaign.sellerId),
      });
    }

    await notifySellerPersonalCategoryApproved(saved);

    await cleanupReplacedSellerPersonalCategoryImage(
      existingCategory?.imageUrl,
      saved.imageUrl,
    );

    return {
      message: "Заявка одобрена",
      campaign: toSellerPersonalCategoryCampaignPayload(saved),
    };
  } catch (error) {
    if (error?.message === "SELLER_PERSONAL_CATEGORY_SLOTS_FULL") {
      throw new AppError(
        409,
        "Все слоты личных категорий заняты. Снимите одну или дождитесь окончания срока.",
      );
    }
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов у продавца. Нужно: ${error.required}, доступно: ${error.available}`,
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
export async function rejectSellerPersonalCategoryCampaign({
  campaignId,
  reason: rawReason,
}) {
  const reason = String(rawReason ?? "").trim() || null;

  const campaign =
    await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  const now = new Date();
  const amount = Math.ceil(Number(campaign.amountPoints) || 0);

  await runInTransaction(async (session) => {
    await releaseLoyaltyPointsReservation({
      userId: String(campaign.sellerId),
      amount,
      session,
    });

    await SellerPersonalCategoryCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SELLER_PERSONAL_CATEGORY_STATUS_REJECTED,
          rejectedReason: reason,
          pointsReleasedAt: now,
        },
      },
      withMongoSession({}, session),
    );
  });

  await notifySellerPersonalCategoryRejected(campaign, reason);

  return { message: "Заявка отклонена" };
}

const loadSellerPersonalCategoryCampaignOrThrow = async (campaignId) => {
  const campaign =
    await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  return campaign;
};

const refundSellerPersonalCategoryCampaignIfCharged = async ({ campaign, session }) => {
  const amount = Math.ceil(Number(campaign.amountPoints) || 0);
  if (amount <= 0 || !campaign.pointsChargedAt) {
    return;
  }

  await refundLoyaltyPoints({
    userId: String(campaign.sellerId),
    amount,
    session,
  });
  await reverseReferralCashbackForSource({
    sourceKind: REFERRAL_SOURCE_KIND_SELLER_PERSONAL_CATEGORY,
    sourceId: String(campaign._id),
    session,
  });
};

const unpublishSellerPersonalCategoryCampaign = async ({ campaign, session }) => {
  if (!campaign.personalCategoryId) {
    return;
  }

  await SellerPersonalCategoryModel.updateOne(
    { _id: campaign.personalCategoryId },
    { $set: { activeUntil: null, activeCampaignId: null } },
    withMongoSession({}, session),
  );

  await unlinkSellerProductsFromPersonalCategory(
    campaign.sellerId,
    campaign.personalCategoryId,
    session,
  );
};

export async function getManagedSellerPersonalCategoryCampaigns() {
  const rows = await SellerPersonalCategoryCampaignModel.find({
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
  })
    .sort({ activatedAt: 1, createdAt: 1 })
    .lean();

  const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)))];
  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("userName userSurname userNickname userProfilePhotoUrl")
    .lean();
  const sellerById = new Map(sellers.map((row) => [String(row._id), row]));

  return {
    campaigns: rows.map((row) => ({
      ...toSellerPersonalCategoryCampaignPayload(row),
      seller: sellerById.get(String(row.sellerId)) ?? null,
    })),
  };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function cancelSellerPersonalCategoryCampaignByStaff({
  staffUserId,
  campaignId,
}) {
  const campaign = await loadSellerPersonalCategoryCampaignOrThrow(campaignId);
  if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE) {
    throw new AppError(409, "Можно снять только активную категорию");
  }

  const now = new Date();

  await runInTransaction(async (session) => {
    await refundSellerPersonalCategoryCampaignIfCharged({ campaign, session });
    await unpublishSellerPersonalCategoryCampaign({ campaign, session });

    await SellerPersonalCategoryCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
          cancelledAt: now,
          cancelledByUserId: staffUserId,
          pointsReleasedAt: now,
          activeUntil: now,
        },
      },
      withMongoSession({}, session),
    );
  });

  await notifySellerPersonalCategoryCancelledByStaff(campaign);

  return { message: "Категория снята с публикации" };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function deleteSellerPersonalCategoryCampaignByStaff({ campaignId }) {
  const campaign = await loadSellerPersonalCategoryCampaignOrThrow(campaignId);

  if (campaign.status === SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
    const amount = Math.ceil(Number(campaign.amountPoints) || 0);

    await runInTransaction(async (session) => {
      if (amount > 0 && !campaign.pointsChargedAt) {
        await releaseLoyaltyPointsReservation({
          userId: String(campaign.sellerId),
          amount,
          session,
        });
      }

      await SellerPersonalCategoryCampaignModel.deleteOne(
        { _id: campaign._id },
        withMongoSession({}, session),
      );
    });

    return { message: "Заявка удалена" };
  }

  if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE) {
    throw new AppError(
      409,
      "Можно удалить только активную категорию или заявку на модерации",
    );
  }

  const category = campaign.personalCategoryId
    ? await SellerPersonalCategoryModel.findById(campaign.personalCategoryId)
        .select("imageUrl")
        .lean()
    : null;

  await runInTransaction(async (session) => {
    await refundSellerPersonalCategoryCampaignIfCharged({ campaign, session });
    await unpublishSellerPersonalCategoryCampaign({ campaign, session });

    if (campaign.personalCategoryId) {
      await SellerPersonalCategoryModel.deleteOne(
        { _id: campaign.personalCategoryId },
        withMongoSession({}, session),
      );
    }

    await SellerPersonalCategoryCampaignModel.deleteOne(
      { _id: campaign._id },
      withMongoSession({}, session),
    );
  });

  if (category?.imageUrl) {
    await cleanupReplacedSellerPersonalCategoryImage(category.imageUrl, null);
  }

  await notifySellerPersonalCategoryDeletedByStaff(campaign);

  return { message: "Категория удалена" };
}
