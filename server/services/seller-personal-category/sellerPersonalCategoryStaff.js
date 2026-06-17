import {
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
  notifySellerPersonalCategoryApproved,
  notifySellerPersonalCategoryRejected,
  toSellerPersonalCategoryCampaignPayload,
} from "./sellerPersonalCategoryHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
} from "../loyalty/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../loyalty/loyaltyPointsSpend.js";
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
export async function approveSellerPersonalCategoryCampaign({ staffUserId, campaignId }) {
  const campaign = await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
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
    const saved = await runInTransaction(async (session) => {
      await chargeReservedLoyaltyPoints({
        userId: String(campaign.sellerId),
        amount,
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

      return activated;
    });

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
export async function rejectSellerPersonalCategoryCampaign({ campaignId, reason: rawReason }) {
  const reason = String(rawReason ?? "").trim() || null;

  const campaign = await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
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
