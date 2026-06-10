import {
  SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
  SELLER_PERSONAL_CATEGORY_OPEN_STATUSES,
  SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  findSellerPersonalCategoryDuration,
} from "../../constants/sellerPersonalCategoryConstants.js";
import {
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
} from "../../models/index.js";
import {
  assertNoOpenSellerPersonalCategoryCampaign,
  toSellerPersonalCategoryCampaignPayload,
  toSellerPersonalCategoryTilePayload,
} from "../../utils/sellerPersonalCategoryHelpers.js";
import {
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../../utils/loyaltyPointsReserve.js";
import { InsufficientLoyaltyPointsError } from "../../utils/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { errorRes, successRes } from "../../utils/index.js";
import { assertSellerPersonalCategoryImageUrlIsUploadedAsset } from "../../utils/validateSellerPersonalCategoryImageUrl.js";

/**
 * @param {Record<string, unknown>} body
 */
const normalizeSubmitBody = (body) => {
  const labelRu = String(body?.labelRu ?? "").trim();
  const imageUrl = String(body?.imageUrl ?? "").trim();
  const tariffCode = String(body?.tariffCode ?? "").trim();

  if (!labelRu) {
    throw new Error("LABEL_REQUIRED");
  }
  if (!tariffCode) {
    throw new Error("TARIFF_REQUIRED");
  }

  assertSellerPersonalCategoryImageUrlIsUploadedAsset(imageUrl);

  const duration = findSellerPersonalCategoryDuration(tariffCode);
  if (!duration) {
    throw new Error("TARIFF_NOT_FOUND");
  }

  return {
    labelRu,
    imageUrl,
    tariffCode,
    durationHours: duration.durationHours,
    amountPoints: duration.pricePoints,
  };
};

export const getSellerPersonalCategoryConfigController = async (_req, res) => {
  try {
    return successRes(res, {
      durations: SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
    });
  } catch (error) {
    console.error("getSellerPersonalCategoryConfigController error:", error);
    return errorRes(res, 500, "Не удалось загрузить тарифы личной категории");
  }
};

export const getSellerPersonalCategoryCatalogTilesController = async (_req, res) => {
  try {
    const now = new Date();
    const rows = await SellerPersonalCategoryModel.find({
      activeUntil: { $gt: now },
    })
      .sort({ activeUntil: -1, updatedAt: -1 })
      .lean();

    return successRes(res, {
      tiles: rows.map(toSellerPersonalCategoryTilePayload),
    });
  } catch (error) {
    console.error("getSellerPersonalCategoryCatalogTilesController error:", error);
    return errorRes(res, 500, "Не удалось загрузить личные категории");
  }
};

export const getMySellerPersonalCategoryCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);
    const campaign = await SellerPersonalCategoryCampaignModel.findOne({
      sellerId: userId,
      status: { $in: SELLER_PERSONAL_CATEGORY_OPEN_STATUSES },
    })
      .sort({ createdAt: -1 })
      .lean();

    return successRes(res, {
      campaign: campaign ? toSellerPersonalCategoryCampaignPayload(campaign) : null,
      durations: SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS,
    });
  } catch (error) {
    console.error("getMySellerPersonalCategoryCampaignController error:", error);
    return errorRes(res, 500, "Не удалось загрузить заявку на личную категорию");
  }
};

export const submitSellerPersonalCategoryCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);

    let payload;
    try {
      payload = normalizeSubmitBody(req.body ?? {});
    } catch (error) {
      if (error instanceof Error && error.message === "LABEL_REQUIRED") {
        return errorRes(res, 400, "Укажите название категории");
      }
      if (error instanceof Error && error.message === "TARIFF_REQUIRED") {
        return errorRes(res, 400, "Выберите срок");
      }
      if (error instanceof Error && error.message === "TARIFF_NOT_FOUND") {
        return errorRes(res, 400, "Срок не найден");
      }
      if (
        error instanceof Error &&
        error.message === "SELLER_PERSONAL_CATEGORY_IMAGE_REQUIRED"
      ) {
        return errorRes(res, 400, "Загрузите картинку категории");
      }
      if (
        error instanceof Error &&
        error.message === "SELLER_PERSONAL_CATEGORY_IMAGE_URL_INVALID"
      ) {
        return errorRes(res, 400, "Используйте файл, загруженный через сайт");
      }
      throw error;
    }

    const reservedAt = new Date();

    try {
      const { campaign, loyaltyPointsBalance } = await runInTransaction(async (session) => {
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
      });

      return successRes(res, {
        message: "Заявка отправлена на модерацию. Баллы зарезервированы.",
        campaign: toSellerPersonalCategoryCampaignPayload(campaign.toObject()),
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
      if (
        error instanceof Error &&
        error.message === "SELLER_PERSONAL_CATEGORY_CAMPAIGN_ALREADY_OPEN"
      ) {
        return errorRes(res, 409, "У вас уже есть активная заявка или личная категория");
      }
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return errorRes(res, 409, "У вас уже есть активная заявка или личная категория");
      }
      throw error;
    }
  } catch (error) {
    console.error("submitSellerPersonalCategoryCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отправить заявку на личную категорию");
  }
};

export const cancelMySellerPersonalCategoryCampaignController = async (req, res) => {
  try {
    const userId = String(req.userId);
    const { campaignId } = req.params;

    const campaign = await SellerPersonalCategoryCampaignModel.findById(campaignId).lean();
    if (!campaign) {
      return errorRes(res, 404, "Заявка не найдена");
    }
    if (String(campaign.sellerId) !== userId) {
      return errorRes(res, 403, "Можно отменить только свою заявку");
    }
    if (campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
      return errorRes(res, 409, "Отменить можно только заявку на модерации");
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

    return successRes(res, {
      message: "Заявка отменена. Баллы возвращены.",
    });
  } catch (error) {
    console.error("cancelMySellerPersonalCategoryCampaignController error:", error);
    return errorRes(res, 500, "Не удалось отменить заявку");
  }
};
