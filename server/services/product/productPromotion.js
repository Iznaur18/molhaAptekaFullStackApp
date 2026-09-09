import { ProductModel, ProductPromotionModel, UserModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  calculateProductPromotionAmountRub,
  findProductPromotionDuration,
  isValidProductPromotionTier,
  PRODUCT_PROMOTION_DURATION_OPTIONS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_TIER_META,
} from "../../constants/productPromotionConstants.js";
import { rublesToLoyaltyPoints } from "../../constants/loyaltyPointsConstants.js";
import { AppError } from "../../errors/AppError.js";
import { isUserStaff } from "../access/adminUserGuard.js";
import { runMoneyIdempotentMutation } from "../loyalty/runMoneyIdempotentMutation.js";
import { quoteAndConsumePromoReturnStreakAmount } from "../promo-return-streak/index.js";
import {
  activateProductPromotionRecord,
  expireProductPromotionsAndSendNotifications,
  buildProductPromotionAlreadyActiveMessage,
  isProductCatalogPromotionActive,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
  PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
  refundProductPromotionPaymentIfNeeded,
  setProductPromotionForProduct,
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
 *   paymentMethod?: unknown;
 *   idempotencyKey: string;
 * }} input
 */
export async function requestProductPromotion({
  userId,
  productId,
  tier: rawTier,
  tariffCode: rawTariffCode,
  paymentMethod: rawPaymentMethod,
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
        paymentMethod: rawPaymentMethod,
      }),
  });
}

/**
 * @param {unknown} raw
 */
const normalizePromotionPaymentMethod = (raw) => {
  const value = String(raw ?? PRODUCT_PROMOTION_PAYMENT_METHOD_SBP).trim();
  if (value === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS) {
    return PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS;
  }
  return PRODUCT_PROMOTION_PAYMENT_METHOD_SBP;
};

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   tier: unknown;
 *   tariffCode: unknown;
 *   paymentMethod?: unknown;
 * }} input
 */
async function requestProductPromotionOnce({
  userId,
  productId,
  tier: rawTier,
  tariffCode: rawTariffCode,
  paymentMethod: rawPaymentMethod,
}) {
  await expireProductPromotionsAndSendNotifications();

  const tier = Number(rawTier);
  const tariffCode = String(rawTariffCode || "").trim();
  const paymentMethod = normalizePromotionPaymentMethod(rawPaymentMethod);

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

  const sellerId = String(product.productSeller);
  const isOwner = sellerId === userId;
  if (!isOwner && !(await isUserStaff(userId))) {
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
  // Заявку, которую нельзя оплатить, лучше не создавать вовсе: она навсегда
  // повисла бы в ожидании оплаты, а продавец получил бы счёт, отбиваемый
  // платёжным слоем. Ноль здесь означает «посчитать не смогли».
  if (amountRub <= 0) {
    throw new AppError(400, "Не удалось рассчитать стоимость продвижения");
  }

  if (paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS) {
    return payProductPromotionWithPoints({
      payerUserId: userId,
      sellerId,
      productId,
      tier,
      tierMeta,
      duration,
      amountRub,
    });
  }

  const quoted = await quoteAndConsumePromoReturnStreakAmount({
    userId,
    amount: amountRub,
  });
  const chargeRub = quoted.amount;

  const promotion = await ProductPromotionModel.create({
    productId,
    sellerId,
    status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
    tier,
    tariffCode: duration.code,
    tariffTitle: duration.title,
    durationHours: duration.durationHours,
    amountRub: chargeRub,
    paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
    amountPoints: null,
    pointsChargedAt: null,
    rubChargedAt: null,
  });

  const discountNote =
    quoted.discountPercent > 0
      ? ` (скидка −${quoted.discountPercent}%)`
      : "";

  return {
    message: `Счёт на ${chargeRub} ₽ выставлен${discountNote} — продвижение начнётся после оплаты.`,
    promotion: toPromotionPayload(promotion.toObject()),
    requiresPayment: true,
    amountRub: chargeRub,
    discountPercent: quoted.discountPercent,
    tierTitle: tierMeta?.title ?? `L${tier}`,
    durationTitle: duration.title,
  };
}

/**
 * Списание баллов 1:1 и мгновенная активация (как после успешного СБП).
 *
 * @param {{
 *   payerUserId: string;
 *   sellerId: string;
 *   productId: string;
 *   tier: number;
 *   tierMeta: { title: string } | undefined;
 *   duration: { code: string; title: string; durationHours: number };
 *   amountRub: number;
 * }} input
 */
async function payProductPromotionWithPoints({
  payerUserId,
  sellerId,
  productId,
  tier,
  tierMeta,
  duration,
  amountRub,
}) {
  let loyaltyPointsBalance;
  /** @type {{ toObject: () => Record<string, unknown> } | null} */
  let promotionDoc = null;
  /** @type {{ deferNotification?: boolean; referrerUserId?: string; amount?: number } | null} */
  let cashback = null;
  let chargedPoints = 0;
  let discountPercent = 0;

  try {
    const result = await runInTransaction(async (session) => {
      const quoted = await quoteAndConsumePromoReturnStreakAmount({
        userId: payerUserId,
        amount: amountRub,
        session,
      });
      const amountPoints = rublesToLoyaltyPoints(quoted.amount);
      if (amountPoints <= 0) {
        throw new AppError(400, "Не удалось рассчитать стоимость продвижения");
      }

      const balance = await deductLoyaltyPoints({
        userId: payerUserId,
        amount: amountPoints,
        session,
      });

      const chargedAt = new Date();
      const activeUntil = new Date(
        chargedAt.getTime() + duration.durationHours * 60 * 60 * 1000,
      );

      const [created] = await ProductPromotionModel.create(
        [
          {
            productId,
            sellerId,
            status: PRODUCT_PROMOTION_STATUS_ACTIVE,
            tier,
            tariffCode: duration.code,
            tariffTitle: duration.title,
            durationHours: duration.durationHours,
            amountRub: quoted.amount,
            paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
            amountPoints,
            pointsChargedAt: chargedAt,
            paidAt: chargedAt,
            activatedAt: chargedAt,
            activeUntil,
          },
        ],
        { session },
      );

      await setProductPromotionForProduct({
        productId,
        tier,
        activatedAt: chargedAt,
        activeUntil,
        session,
      });

      const credited = await creditReferralCashbackFromSpend({
        spenderUserId: payerUserId,
        pointsSpent: amountPoints,
        sourceKind: REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION,
        sourceId: String(created._id),
        session,
      });

      return {
        promotion: created,
        balance,
        cashback: credited,
        amountPoints,
        discountPercent: quoted.discountPercent,
      };
    });

    loyaltyPointsBalance = result.balance;
    promotionDoc = result.promotion;
    cashback = result.cashback;
    chargedPoints = result.amountPoints;
    discountPercent = result.discountPercent;
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    throw error;
  }

  if (cashback?.deferNotification) {
    await notifyReferralCashbackCredited({
      referrerUserId: cashback.referrerUserId,
      amount: cashback.amount,
      spenderUserId: payerUserId,
    });
  }

  await createUserInAppNotification({
    userId: sellerId,
    kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
    message: `Продвижение товара активировано (${tierMeta?.title ?? `L${tier}`}, ${duration.title})`,
    productId,
    ...(payerUserId !== sellerId ? { actorUserId: payerUserId } : {}),
  });

  return {
    message: `Продвижение активировано — списано ${chargedPoints} баллов${
      discountPercent > 0 ? ` (−${discountPercent}%)` : ""
    }.`,
    promotion: toPromotionPayload(promotionDoc.toObject()),
    requiresPayment: false,
    amountRub: promotionDoc.amountRub,
    amountPoints: chargedPoints,
    discountPercent,
    loyaltyPointsBalance,
    tierTitle: tierMeta?.title ?? `L${tier}`,
    durationTitle: duration.title,
  };
}

/**
 * Продвижение, ожидающее оплаты, — для выставления счёта платёжным слоем.
 *
 * Заодно проверяет, что заявку может оплатить продавец или staff: сумму и
 * цель платежа определяет сервер, а не запрос.
 *
 * @param {string} promotionId
 * @param {string} userId
 */
export async function loadPayableProductPromotion(promotionId, userId) {
  const promotion = await ProductPromotionModel.findOne({
    _id: promotionId,
    status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
    paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
  }).lean();

  if (!promotion) {
    return null;
  }

  const isSeller = String(promotion.sellerId) === userId;
  if (!isSeller && !(await isUserStaff(userId))) {
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
