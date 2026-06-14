import { ProductModel, ProductPromotionModel, UserModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  calculateProductPromotionAmountRub,
  calculateProductPromotionPointsCost,
  findProductPromotionDuration,
  isValidProductPromotionTier,
  PRODUCT_PROMOTION_DURATION_OPTIONS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_TIER_META,
} from "../../constants/productPromotionConstants.js";
import {
  activateProductPromotionRecord,
  expireProductPromotionsAndSendNotifications,
  isProductCatalogPromotionActive,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
  refundProductPromotionPaymentIfNeeded,
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

const toStaffPromotionPayload = (row, { product, seller }) => ({
  ...toPromotionPayload(row),
  productName: product?.productName ?? row.productName ?? null,
  seller: seller
    ? {
        _id: String(seller._id),
        userName: seller.userName ?? null,
      }
    : null,
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

export const getPendingProductPromotionsController = async (req, res) => {
  try {
    await expireProductPromotionsAndSendNotifications();
    const rows = await ProductPromotionModel.find({
      status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    const productIds = [...new Set(rows.map((row) => String(row.productId)))];
    const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)))];

    const [products, sellers] = await Promise.all([
      ProductModel.find({ _id: { $in: productIds } })
        .select("productName")
        .lean(),
      UserModel.find({ _id: { $in: sellerIds } })
        .select("userName")
        .lean(),
    ]);

    const productById = Object.fromEntries(
      products.map((product) => [String(product._id), product]),
    );
    const sellerById = Object.fromEntries(
      sellers.map((seller) => [String(seller._id), seller]),
    );

    return successRes(res, {
      promotions: rows.map((row) =>
        toStaffPromotionPayload(row, {
          product: productById[String(row.productId)] ?? null,
          seller: sellerById[String(row.sellerId)] ?? null,
        }),
      ),
    });
  } catch (error) {
    console.error("getPendingProductPromotionsController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке очереди продвижения");
  }
};

export const getPendingProductPromotionsCountController = async (req, res) => {
  try {
    const count = await ProductPromotionModel.countDocuments({
      status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    });
    return successRes(res, { count });
  } catch (error) {
    console.error("getPendingProductPromotionsCountController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке счётчика продвижения");
  }
};

export const approveProductPromotionController = async (req, res) => {
  try {
    const staffId = String(req.userId);
    const promotion = await ProductPromotionModel.findById(req.params.promotionId);
    if (!promotion) {
      return errorRes(res, 404, "Заявка на продвижение не найдена");
    }
    if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
      return errorRes(res, 409, "Заявка уже обработана");
    }

    const product = await ProductModel.findById(promotion.productId).lean();
    if (!product) {
      return errorRes(res, 404, "Товар не найден");
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

    const tierMeta = PRODUCT_PROMOTION_TIER_META.find((item) => item.tier === promotion.tier);
    const promotionMessage = `Продвижение товара одобрено (${tierMeta?.title ?? `L${promotion.tier}`}, ${promotion.tariffTitle})`;

    promotion.approvedByUserId = staffId;
    await activateProductPromotionRecord(promotion, {
      notificationMessage: promotionMessage,
      actorUserId: staffId,
    });

    return successRes(res, {
      message: "Продвижение одобрено",
      promotion: toPromotionPayload(promotion.toObject()),
    });
  } catch (error) {
    console.error("approveProductPromotionController error:", error);
    return errorRes(res, 500, "Ошибка при одобрении продвижения");
  }
};

export const rejectProductPromotionController = async (req, res) => {
  try {
    const staffId = String(req.userId);
    const promotion = await ProductPromotionModel.findById(req.params.promotionId);
    if (!promotion) {
      return errorRes(res, 404, "Заявка на продвижение не найдена");
    }
    if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
      return errorRes(res, 409, "Заявка уже обработана");
    }

    promotion.status = PRODUCT_PROMOTION_STATUS_REJECTED;
    await promotion.save();
    await refundProductPromotionPaymentIfNeeded(promotion._id);

    await createUserInAppNotification({
      userId: promotion.sellerId,
      kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
      message: "Заявка на продвижение отклонена",
      productId: promotion.productId,
      actorUserId: staffId,
    });

    return successRes(res, {
      message: "Заявка на продвижение отклонена",
      promotion: toPromotionPayload(promotion.toObject()),
    });
  } catch (error) {
    console.error("rejectProductPromotionController error:", error);
    return errorRes(res, 500, "Ошибка при отклонении продвижения");
  }
};
