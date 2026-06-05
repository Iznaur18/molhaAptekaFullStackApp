import { ProductModel, ProductPromotionModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  calculateProductPromotionAmountRub,
  calculateProductPromotionPointsCost,
  findProductPromotionDuration,
  isValidProductPromotionTier,
  PRODUCT_PROMOTION_DURATION_OPTIONS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_TIER_META,
} from "../../constants/productPromotionConstants.js";
import {
  activateProductPromotionRecord,
  expireProductPromotionsAndSendNotifications,
  isProductCatalogPromotionActive,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
} from "../../utils/productPromotionHelpers.js";
import {
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../../utils/loyaltyPointsSpend.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { createUserInAppNotification } from "../../utils/userInAppNotifications.js";
import { errorRes, successRes } from "../../utils/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const toPromotionPayload = (row) => ({
  _id: String(row._id),
  productId: String(row.productId),
  sellerId: String(row.sellerId),
  status: row.status,
  tier: row.tier ?? null,
  tariffCode: row.tariffCode,
  tariffTitle: row.tariffTitle,
  durationHours: row.durationHours,
  amountRub: row.amountRub,
  paymentMethod: row.paymentMethod ?? PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  amountPoints: row.amountPoints ?? null,
  pointsChargedAt: row.pointsChargedAt ?? null,
  pointsRefundedAt: row.pointsRefundedAt ?? null,
  rubChargedAt: row.rubChargedAt ?? null,
  rubRefundedAt: row.rubRefundedAt ?? null,
  productName: row.productName ?? null,
  activatedAt: row.activatedAt,
  activeUntil: row.activeUntil,
  cancelledAt: row.cancelledAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const getProductPromotionTariffsController = async (req, res) => {
  try {
    return successRes(res, {
      tiers: PRODUCT_PROMOTION_TIER_META,
      durations: PRODUCT_PROMOTION_DURATION_OPTIONS.map((item) => ({
        code: item.code,
        title: item.title,
        durationHours: item.durationHours,
        durationMult: item.durationMult,
      })),
    });
  } catch (error) {
    console.error("getProductPromotionTariffsController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке тарифов продвижения");
  }
};

export const requestProductPromotionController = async (req, res) => {
  try {
    await expireProductPromotionsAndSendNotifications();
    const userId = String(req.userId);
    const { productId } = req.params;
    const tier = Number(req.body?.tier);
    const tariffCode = String(req.body?.tariffCode || "").trim();

    if (!isValidProductPromotionTier(tier)) {
      return errorRes(res, 400, "Выберите уровень продвижения");
    }
    if (!tariffCode) {
      return errorRes(res, 400, "Выберите срок продвижения");
    }

    const product = await ProductModel.findById(productId).lean();
    if (!product) {
      return errorRes(res, 404, "Товар не найден");
    }
    if (String(product.productSeller) !== userId) {
      return errorRes(res, 403, "Продвижение доступно только владельцу товара");
    }
    if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
      return errorRes(res, 409, "Товар должен быть одобрен модерацией");
    }
    if (product.productIsAvailable === false) {
      return errorRes(res, 409, "Скрытый товар нельзя продвигать");
    }
    if (isProductCatalogPromotionActive(product)) {
      return errorRes(res, 409, "У товара уже есть активное продвижение");
    }

    const duration = findProductPromotionDuration(tariffCode);
    if (!duration) {
      return errorRes(res, 400, "Срок продвижения не найден");
    }

    const tierMeta = PRODUCT_PROMOTION_TIER_META.find((item) => item.tier === tier);
    const chargedAt = new Date();
    const amountPoints = calculateProductPromotionPointsCost({
      productPrice: product.productPrice,
      tier,
      durationCode: tariffCode,
    });
    const amountRub = calculateProductPromotionAmountRub({
      productPrice: product.productPrice,
      tier,
      durationCode: tariffCode,
    });
    const promotionMessage = "Продвижение товара активировано";

    try {
      const { promotion, loyaltyPointsBalance } = await runInTransaction(
        async (session) => {
          const loyaltyPointsBalance = await deductLoyaltyPoints({
            userId,
            amount: amountPoints,
            session,
          });

          const [promotion] = await ProductPromotionModel.create(
            [
              {
                productId,
                sellerId: userId,
                status: PRODUCT_PROMOTION_STATUS_ACTIVE,
                tier,
                tariffCode: duration.code,
                tariffTitle: duration.title,
                durationHours: duration.durationHours,
                amountRub,
                paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
                amountPoints,
                pointsChargedAt: chargedAt,
                rubChargedAt: null,
              },
            ],
            withMongoSession({}, session),
          );

          await activateProductPromotionRecord(promotion, {
            notificationMessage: promotionMessage,
            session,
            skipNotification: true,
          });

          return { promotion, loyaltyPointsBalance };
        },
      );

      await createUserInAppNotification({
        userId: promotion.sellerId,
        kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
        message: `${promotionMessage} (${tierMeta?.title ?? `L${tier}`}, ${duration.title})`,
        productId: promotion.productId,
      });

      return successRes(res, {
        message: "Продвижение активировано. Баллы списаны.",
        promotion: toPromotionPayload(promotion.toObject()),
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
      console.error("requestProductPromotionController error:", error);
      return errorRes(res, 500, "Ошибка при активации продвижения");
    }
  } catch (error) {
    console.error("requestProductPromotionController error:", error);
    return errorRes(res, 500, "Ошибка при активации продвижения");
  }
};

export const getMyProductPromotionsController = async (req, res) => {
  try {
    await expireProductPromotionsAndSendNotifications();
    const { page, limit, skip } = parsePagination(req.query);
    const statusRaw = String(req.query.status || "").trim();
    const filter = {
      sellerId: String(req.userId),
      ...(statusRaw ? { status: statusRaw } : {}),
    };

    const [rows, total] = await Promise.all([
      ProductPromotionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductPromotionModel.countDocuments(filter),
    ]);

    return successRes(res, {
      promotions: rows.map(toPromotionPayload),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getMyProductPromotionsController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке моих продвижений");
  }
};
