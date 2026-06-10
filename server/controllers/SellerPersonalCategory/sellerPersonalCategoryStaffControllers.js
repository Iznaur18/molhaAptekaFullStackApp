import {
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  SELLER_PERSONAL_CATEGORY_STATUS_REJECTED,
} from "../../constants/sellerPersonalCategoryConstants.js";
import {
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
  UserModel,
} from "../../models/index.js";
import { cleanupReplacedSellerPersonalCategoryImage } from "../../utils/cleanupReplacedSellerPersonalCategoryImage.js";
import {
  activateSellerPersonalCategoryCampaign,
  notifySellerPersonalCategoryApproved,
  notifySellerPersonalCategoryRejected,
  toSellerPersonalCategoryCampaignPayload,
} from "../../utils/sellerPersonalCategoryHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
} from "../../utils/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../../utils/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { errorRes, successRes } from "../../utils/index.js";

const DEFAULT_MODERATION_LIMIT = 50;

export const getPendingSellerPersonalCategoryCampaignsCountController = async (
  _req,
  res,
) => {
  try {
    const count = await SellerPersonalCategoryCampaignModel.countDocuments({
      status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
    });
    return successRes(res, { count });
  } catch (error) {
    console.error("getPendingSellerPersonalCategoryCampaignsCountController error:", error);
    return errorRes(res, 500, "Не удалось загрузить очередь личных категорий");
  }
};

export const getPendingSellerPersonalCategoryCampaignsController = async (req, res) => {
  try {
    const limit = Math.min(
      DEFAULT_MODERATION_LIMIT,
      Math.max(1, Number(req.query.limit) || DEFAULT_MODERATION_LIMIT),
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

    const campaigns = rows.map((row) => ({
      ...toSellerPersonalCategoryCampaignPayload(row),
      seller: sellerById.get(String(row.sellerId)) ?? null,
    }));

    return successRes(res, { campaigns });
  } catch (error) {
    console.error("getPendingSellerPersonalCategoryCampaignsController error:", error);
    return errorRes(res, 500, "Не удалось загрузить очередь личных категорий");
  }
};

export const approveSellerPersonalCategoryCampaignController = async (req, res) => {
  try {
    const staffUserId = req.userId;
    const { campaignId } = req.params;

    const campaign = await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
      return errorRes(res, 409, "Заявка уже обработана");
    }

    const amount = Math.ceil(Number(campaign.amountPoints) || 0);
    const existingCategory = await SellerPersonalCategoryModel.findOne({
      sellerId: campaign.sellerId,
    })
      .select("imageUrl")
      .lean();

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

    return successRes(res, {
      message: "Заявка одобрена",
      campaign: toSellerPersonalCategoryCampaignPayload(saved),
    });
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      return errorRes(
        res,
        409,
        `Недостаточно баллов у продавца. Нужно: ${error.required}, доступно: ${error.available}`,
      );
    }
    console.error("approveSellerPersonalCategoryCampaignController error:", error);
    return errorRes(res, 500, "Не удалось одобрить заявку");
  }
};

export const rejectSellerPersonalCategoryCampaignController = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const reason = String(req.body?.reason ?? "").trim() || null;

    const campaign = await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
      return errorRes(res, 409, "Заявка уже обработана");
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

    return successRes(res, {
      message: "Заявка отклонена",
    });
  } catch (error) {
    console.error("rejectSellerPersonalCategoryCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отклонить заявку");
  }
};
