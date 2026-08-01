import {
  SELLER_PERSONAL_CATEGORY_ACTIVE_SLOT_LIMIT,
  SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
  SELLER_PERSONAL_CATEGORY_OPEN_STATUSES,
  SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
} from "../../constants/sellerPersonalCategoryConstants.js";
import {
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
} from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertNoOpenSellerPersonalCategoryCampaign,
  countActiveSellerPersonalCategorySlots,
  toSellerPersonalCategoryCampaignPayload,
  toSellerPersonalCategoryTilePayload,
} from "./sellerPersonalCategoryHelpers.js";
import {
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../loyalty/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../loyalty/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

import { parseSellerPersonalCategorySubmitBody } from "./sellerPersonalCategoryServiceHelpers.js";

export async function getSellerPersonalCategoryConfig() {
  const activeSlots = await countActiveSellerPersonalCategorySlots();
  return {
    durations: SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
    activeSlotLimit: SELLER_PERSONAL_CATEGORY_ACTIVE_SLOT_LIMIT,
    activeSlots,
  };
}

export async function getSellerPersonalCategoryCatalogTiles({ viewerRegionCode } = {}) {
  const now = new Date();
  const regionCode = String(viewerRegionCode ?? "").trim();
  const rows = await SellerPersonalCategoryModel.find({
    activeUntil: { $gt: now },
    ...(regionCode ? { regionCode } : {}),
  })
    .sort({ activeUntil: -1, updatedAt: -1 })
    .limit(SELLER_PERSONAL_CATEGORY_ACTIVE_SLOT_LIMIT)
    .lean();

  return {
    tiles: rows.map(toSellerPersonalCategoryTilePayload),
  };
}

/**
 * @param {{ userId: string }} input
 */
export async function getMySellerPersonalCategoryCampaign({ userId }) {
  const campaign = await SellerPersonalCategoryCampaignModel.findOne({
    sellerId: userId,
    status: { $in: SELLER_PERSONAL_CATEGORY_OPEN_STATUSES },
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    campaign: campaign ? toSellerPersonalCategoryCampaignPayload(campaign) : null,
    durations: SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
  };
}

/**
 * @param {{
 *   userId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function submitSellerPersonalCategoryCampaign({ userId, body }) {
  const payload = parseSellerPersonalCategorySubmitBody(body ?? {});
  const reservedAt = new Date();

  try {
    const { campaign, loyaltyPointsBalance } = await runInTransaction(
      async (session) => {
        await assertNoOpenSellerPersonalCategoryCampaign(userId, session);

        const loyaltyPointsBalance = await reserveLoyaltyPoints({
          userId,
          amount: payload.amountPoints,
          session,
        });

        const [campaign] = await SellerPersonalCategoryCampaignModel.create(
          [
            {
              sellerId: userId,
              status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
              ...payload,
              pointsReservedAt: reservedAt,
            },
          ],
          withMongoSession({}, session),
        );

        return { campaign, loyaltyPointsBalance };
      },
    );

    return {
      message: "Заявка отправлена на модерацию. Баллы зарезервированы.",
      campaign: toSellerPersonalCategoryCampaignPayload(campaign.toObject()),
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
      error.message === "SELLER_PERSONAL_CATEGORY_CAMPAIGN_ALREADY_OPEN"
    ) {
      throw new AppError(409, "У вас уже есть активная заявка или личная категория");
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw new AppError(409, "У вас уже есть активная заявка или личная категория");
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
export async function cancelMySellerPersonalCategoryCampaign({ userId, campaignId }) {
  const campaign =
    await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (String(campaign.sellerId) !== userId) {
    throw new AppError(403, "Можно отменить только свою заявку");
  }
  if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
    throw new AppError(409, "Отменить можно только заявку на модерации");
  }

  const now = new Date();
  const amount = Math.ceil(Number(campaign.amountPoints) || 0);

  await runInTransaction(async (session) => {
    await releaseLoyaltyPointsReservation({ userId, amount, session });

    await SellerPersonalCategoryCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
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
