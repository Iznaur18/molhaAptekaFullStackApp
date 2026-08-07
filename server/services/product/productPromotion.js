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
import { AppError } from "../../errors/AppError.js";
import { runMoneyIdempotentMutation } from "../loyalty/runMoneyIdempotentMutation.js";
import {
  activateProductPromotionRecord,
  expireProductPromotionsAndSendNotifications,
  isProductCatalogPromotionActive,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
  refundProductPromotionPaymentIfNeeded,
} from "./productPromotionHelpers.js";
import {
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION } from "../../constants/referralConstants.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

import {
  buildPromotionPagination,
  parsePromotionPagination,
  toPromotionPayload,
  toStaffPromotionPayload,
} from "./productPromotionServiceHelpers.js";

export function getProductPromotionTariffs() {
  return {
    tiers: PRODUCT_PROMOTION_TIER_META,
    durations: PRODUCT_PROMOTION_DURATION_OPTIONS.map((item) => ({
      code: item.code,
      title: item.title,
      durationHours: item.durationHours,
      durationMult: item.durationMult,
    })),
  };
}

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   tier: unknown;
 *   tariffCode: unknown;
 *   idempotencyKey: string;
 * }} input
 */
export async function requestProductPromotion({
  userId,
  productId,
  tier: rawTier,
  tariffCode: rawTariffCode,
  idempotencyKey,
}) {
  return runMoneyIdempotentMutation({
    scope: `product_promotion:${String(productId)}`,
    actorUserId: userId,
    idempotencyKey,
    execute: () =>
      requestProductPromotionOnce({
        userId,
        productId,
        tier: rawTier,
        tariffCode: rawTariffCode,
      }),
  });
}

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   tier: unknown;
 *   tariffCode: unknown;
 * }} input
 */
async function requestProductPromotionOnce({
  userId,
  productId,
  tier: rawTier,
  tariffCode: rawTariffCode,
}) {
  await expireProductPromotionsAndSendNotifications();

  const tier = Number(rawTier);
  const tariffCode = String(rawTariffCode || "").trim();

  if (!isValidProductPromotionTier(tier)) {
    throw new AppError(400, "Выберите уровень продвижения");
  }
  if (!tariffCode) {
    throw new AppError(400, "Выберите срок продвижения");
  }

  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (String(product.productSeller) !== userId) {
    throw new AppError(403, "Продвижение доступно только владельцу товара");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(409, "Товар должен быть одобрен модерацией");
  }
  if (product.productIsAvailable === false) {
    throw new AppError(409, "Скрытый товар нельзя продвигать");
  }
  if (isProductCatalogPromotionActive(product)) {
    throw new AppError(409, "У товара уже есть активное продвижение");
  }

  const duration = findProductPromotionDuration(tariffCode);
  if (!duration) {
    throw new AppError(400, "Срок продвижения не найден");
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
    const { promotion, loyaltyPointsBalance, cashback } = await runInTransaction(
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

        const cashback = await creditReferralCashbackFromSpend({
          spenderUserId: userId,
          pointsSpent: amountPoints,
          sourceKind: REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION,
          sourceId: String(promotion._id),
          session,
        });

        return { promotion, loyaltyPointsBalance, cashback };
      },
    );

    if (cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: cashback.referrerUserId,
        amount: cashback.amount,
        spenderUserId: userId,
      });
    }

    await createUserInAppNotification({
      userId: promotion.sellerId,
      kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
      message: `${promotionMessage} (${tierMeta?.title ?? `L${tier}`}, ${duration.title})`,
      productId: promotion.productId,
    });

    return {
      message: "Продвижение запущено — баллы списаны с баланса.",
      promotion: toPromotionPayload(promotion.toObject()),
      loyaltyPointsBalance: loyaltyPointsBalance ?? null,
    };
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    throw error;
  }
}

/**
 * @param {{
 *   userId: string;
 *   query: Record<string, unknown>;
 * }} input
 */
export async function getMyProductPromotions({ userId, query }) {
  await expireProductPromotionsAndSendNotifications();

  const { page, limit, skip } = parsePromotionPagination(query);
  const statusRaw = String(query.status || "").trim();
  const filter = {
    sellerId: userId,
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

  return {
    promotions: rows.map(toPromotionPayload),
    pagination: buildPromotionPagination(page, limit, total),
  };
}

export async function getPendingProductPromotions() {
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

  return {
    promotions: rows.map((row) =>
      toStaffPromotionPayload(row, {
        product: productById[String(row.productId)] ?? null,
        seller: sellerById[String(row.sellerId)] ?? null,
      }),
    ),
  };
}

export async function countPendingProductPromotions() {
  const count = await ProductPromotionModel.countDocuments({
    status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  });
  return { count };
}

/**
 * @param {{
 *   staffId: string;
 *   promotionId: string;
 * }} input
 */
export async function approveProductPromotion({ staffId, promotionId }) {
  const promotion = await ProductPromotionModel.findById(promotionId);
  if (!promotion) {
    throw new AppError(404, "Заявка на продвижение не найдена");
  }
  if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Заявка уже обработана");
  }

  const product = await ProductModel.findById(promotion.productId).lean();
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(409, "Товар должен быть одобрен модерацией");
  }
  if (product.productIsAvailable === false) {
    throw new AppError(409, "Скрытый товар нельзя продвигать");
  }
  if (isProductCatalogPromotionActive(product)) {
    throw new AppError(409, "У товара уже есть активное продвижение");
  }

  const tierMeta = PRODUCT_PROMOTION_TIER_META.find(
    (item) => item.tier === promotion.tier,
  );
  const promotionMessage = `Продвижение товара одобрено (${tierMeta?.title ?? `L${promotion.tier}`}, ${promotion.tariffTitle})`;

  promotion.approvedByUserId = staffId;
  await activateProductPromotionRecord(promotion, {
    notificationMessage: promotionMessage,
    actorUserId: staffId,
  });

  return {
    message: "Продвижение одобрено",
    promotion: toPromotionPayload(promotion.toObject()),
  };
}

/**
 * @param {{
 *   staffId: string;
 *   promotionId: string;
 * }} input
 */
export async function rejectProductPromotion({ staffId, promotionId }) {
  const promotion = await ProductPromotionModel.findById(promotionId);
  if (!promotion) {
    throw new AppError(404, "Заявка на продвижение не найдена");
  }
  if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Заявка уже обработана");
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

  return {
    message: "Заявка на продвижение отклонена",
    promotion: toPromotionPayload(promotion.toObject()),
  };
}
