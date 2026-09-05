import { ProductModel, ProductPromotionModel, UserModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  calculateProductPromotionAmountRub,
  findProductPromotionDuration,
  isValidProductPromotionTier,
  PRODUCT_PROMOTION_DURATION_OPTIONS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_TIER_META,
} from "../../constants/productPromotionConstants.js";
import { AppError } from "../../errors/AppError.js";
import { runMoneyIdempotentMutation } from "../loyalty/runMoneyIdempotentMutation.js";
import {
  activateProductPromotionRecord,
  expireProductPromotionsAndSendNotifications,
  buildProductPromotionAlreadyActiveMessage,
  isProductCatalogPromotionActive,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
  refundProductPromotionPaymentIfNeeded,
} from "./productPromotionHelpers.js";
import {
} from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION } from "../../constants/referralConstants.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
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
    throw new AppError(409, buildProductPromotionAlreadyActiveMessage(product));
  }

  const duration = findProductPromotionDuration(tariffCode);
  if (!duration) {
    throw new AppError(400, "Срок продвижения не найден");
  }

  const tierMeta = PRODUCT_PROMOTION_TIER_META.find((item) => item.tier === tier);

  const amountRub = calculateProductPromotionAmountRub({
    productPrice: product.productPrice,
    tier,
    durationCode: tariffCode,
  });
  // Заявка больше не списывает баллы: продвижение оплачивается по СБП, а
  // деньги от провайдера приходят асинхронно. Поэтому запись создаётся
  // неактивной, а включает её подтверждённый платёж.
  const promotion = await ProductPromotionModel.create({
    productId,
    sellerId: userId,
    status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
    tier,
    tariffCode: duration.code,
    tariffTitle: duration.title,
    durationHours: duration.durationHours,
    amountRub,
    paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
    amountPoints: null,
    pointsChargedAt: null,
    rubChargedAt: null,
  });

  return {
    message: `Счёт на ${amountRub} ₽ выставлен — продвижение начнётся после оплаты.`,
    promotion: toPromotionPayload(promotion.toObject()),
    requiresPayment: true,
    amountRub,
    tierTitle: tierMeta?.title ?? `L${tier}`,
    durationTitle: duration.title,
  };
}

/**
 * Продвижение, ожидающее оплаты, — для выставления счёта платёжным слоем.
 *
 * Заодно проверяет, что заявка принадлежит этому продавцу: сумму и цель
 * платежа определяет сервер, а не запрос.
 *
 * @param {string} promotionId
 * @param {string} userId
 */
export async function loadPayableProductPromotion(promotionId, userId) {
  const promotion = await ProductPromotionModel.findOne({
    _id: promotionId,
    sellerId: userId,
    status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
  }).lean();

  if (!promotion) {
    return null;
  }

  const meta = PRODUCT_PROMOTION_TIER_META.find((item) => item.tier === promotion.tier);
  return {
    amountRub: Number(promotion.amountRub) || 0,
    description: `Продвижение товара: ${meta?.title ?? `L${promotion.tier}`}, ${promotion.tariffTitle}`,
  };
}

/**
 * Включить продвижение после оплаты.
 *
 * Единственный вход — подтверждённый платёж; пользователь сюда не попадает.
 *
 * @param {string} promotionId
 * @param {string} paymentId
 */
export async function activateProductPromotionAfterPayment(promotionId, paymentId) {
  const chargedAt = new Date();

  const { promotion, cashback } = await runInTransaction(async (session) => {
    // Фильтр по статусу — защита от повторного уведомления: второй раз
    // запись просто не найдётся, и срок продвижения не удвоится.
    const found = await ProductPromotionModel.findOneAndUpdate(
      { _id: promotionId, status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT },
      {
        $set: {
          status: PRODUCT_PROMOTION_STATUS_ACTIVE,
          rubChargedAt: chargedAt,
          paidAt: chargedAt,
          paymentId,
        },
      },
      { returnDocument: "after", session },
    );

    if (!found) {
      return { promotion: null, cashback: null };
    }

    await activateProductPromotionRecord(found, {
      notificationMessage: "Продвижение товара активировано",
      session,
      skipNotification: true,
    });

    // Реферальный кэшбэк считается от потраченного. Баллы и рубли у вас 1:1,
    // поэтому рублёвая сумма подставляется без пересчёта.
    const credited = await creditReferralCashbackFromSpend({
      spenderUserId: String(found.sellerId),
      pointsSpent: Number(found.amountRub) || 0,
      sourceKind: REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION,
      sourceId: String(found._id),
      session,
    });

    return { promotion: found, cashback: credited };
  });

  if (!promotion) {
    return null;
  }

  if (cashback?.deferNotification) {
    await notifyReferralCashbackCredited({
      referrerUserId: cashback.referrerUserId,
      amount: cashback.amount,
      spenderUserId: String(promotion.sellerId),
    });
  }

  const activeMeta = PRODUCT_PROMOTION_TIER_META.find(
    (item) => item.tier === promotion.tier,
  );
  await createUserInAppNotification({
    userId: promotion.sellerId,
    kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
    message: `Продвижение товара активировано (${activeMeta?.title ?? `L${promotion.tier}`}, ${promotion.tariffTitle})`,
    productId: promotion.productId,
  });

  return promotion;
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
    throw new AppError(409, buildProductPromotionAlreadyActiveMessage(product));
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
