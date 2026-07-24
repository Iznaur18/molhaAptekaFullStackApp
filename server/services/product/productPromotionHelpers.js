import { ProductModel, ProductPromotionModel } from "../../models/index.js";
import {
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
  PRODUCT_PROMOTION_REMINDER_HOURS,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
} from "../../constants/productPromotionConstants.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { refundLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import { refundRubBalance } from "../loyalty/rubBalanceSpend.js";
import { reverseReferralCashbackForSource } from "../referral/reverseReferralCashbackForSource.js";
import { REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION } from "../../constants/referralConstants.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

export const PRODUCT_PROMOTION_NOTIFICATION_KIND_REMINDER =
  "product_promotion_expiring_soon";
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_EXPIRED = "product_promotion_expired";
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED =
  "product_promotion_approved";
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED =
  "product_promotion_rejected";
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_CANCELLED =
  "product_promotion_cancelled";

export const clearProductPromotionForProduct = async (productId) => {
  await ProductModel.updateOne(
    { _id: productId },
    {
      $set: {
        catalogPromotionTier: null,
        catalogPromotionActivatedAt: null,
        catalogPromotionExpiresAt: null,
      },
    },
  );
};

export const setProductPromotionForProduct = async ({
  productId,
  tier,
  activatedAt,
  activeUntil,
  session = null,
}) => {
  await ProductModel.updateOne(
    { _id: productId },
    {
      $set: {
        catalogPromotionTier: tier,
        catalogPromotionActivatedAt: activatedAt,
        catalogPromotionExpiresAt: activeUntil,
      },
    },
    withMongoSession({}, session),
  );
};

/**
 * Возврат баллов за заявку, если продвижение не было активировано.
 * @param {import('mongoose').Types.ObjectId | string} promotionId
 */
export const refundProductPromotionPointsIfNeeded = async (promotionId) => {
  const now = new Date();
  return runInTransaction(async (session) => {
    const promotion = await ProductPromotionModel.findOneAndUpdate(
      {
        _id: promotionId,
        paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
        pointsChargedAt: { $ne: null },
        pointsRefundedAt: null,
        activatedAt: null,
        amountPoints: { $gt: 0 },
      },
      { $set: { pointsRefundedAt: now } },
      withMongoSession({}, session),
    ).lean();

    if (!promotion) {
      return false;
    }

    await refundLoyaltyPoints({
      userId: String(promotion.sellerId),
      amount: promotion.amountPoints,
      session,
    });
    await reverseReferralCashbackForSource({
      sourceKind: REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION,
      sourceId: String(promotion._id),
      session,
    });
    return true;
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} promotionId
 */
export const refundProductPromotionRubIfNeeded = async (promotionId) => {
  const now = new Date();
  const promotion = await ProductPromotionModel.findOneAndUpdate(
    {
      _id: promotionId,
      paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
      rubChargedAt: { $ne: null },
      rubRefundedAt: null,
      activatedAt: null,
      amountRub: { $gt: 0 },
    },
    { $set: { rubRefundedAt: now } },
  ).lean();

  if (!promotion) {
    return false;
  }

  await refundRubBalance({
    userId: String(promotion.sellerId),
    amount: promotion.amountRub,
  });
  return true;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} promotionId
 */
export const refundProductPromotionPaymentIfNeeded = async (promotionId) => {
  await refundProductPromotionPointsIfNeeded(promotionId);
  await refundProductPromotionRubIfNeeded(promotionId);
};

/**
 * Активирует заявку: статус active, даты и tier на товаре, уведомление продавцу.
 * @param {import('mongoose').Document} promotion
 * @param {{
 *   notificationMessage?: string;
 *   actorUserId?: import('mongoose').Types.ObjectId | string | null;
 *   session?: import('mongoose').ClientSession | null;
 *   skipNotification?: boolean;
 * }} [options]
 */
export const activateProductPromotionRecord = async (promotion, options = {}) => {
  const {
    notificationMessage = "Продвижение товара активировано",
    actorUserId = null,
    session = null,
    skipNotification = false,
  } = options;

  const activatedAt = new Date();
  const activeUntil = new Date(
    activatedAt.getTime() + promotion.durationHours * 60 * 60 * 1000,
  );

  promotion.status = PRODUCT_PROMOTION_STATUS_ACTIVE;
  promotion.activatedAt = activatedAt;
  promotion.activeUntil = activeUntil;
  await promotion.save({ session: session ?? undefined });

  await setProductPromotionForProduct({
    productId: promotion.productId,
    tier: promotion.tier,
    activatedAt,
    activeUntil,
    session,
  });

  if (!skipNotification) {
    await createUserInAppNotification({
      userId: promotion.sellerId,
      kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
      message: notificationMessage,
      productId: promotion.productId,
      ...(actorUserId ? { actorUserId } : {}),
    });
  }

  return { activatedAt, activeUntil };
};

/**
 * @param {{ productId: string; statuses: string[] }} params
 */
export const cancelProductPromotionsForProduct = async ({ productId, statuses }) => {
  const rows = await ProductPromotionModel.find({
    productId,
    status: { $in: statuses },
  }).lean();

  if (rows.length === 0) {
    return;
  }

  const now = new Date();
  const rowIds = rows.map((row) => row._id);
  await ProductPromotionModel.updateMany(
    { _id: { $in: rowIds } },
    {
      $set: {
        status: PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
        cancelledAt: now,
      },
    },
  );

  const hadActive = rows.some((row) => row.status === PRODUCT_PROMOTION_STATUS_ACTIVE);
  if (hadActive) {
    await clearProductPromotionForProduct(productId);
  }

  await Promise.all(rowIds.map((id) => refundProductPromotionPaymentIfNeeded(id)));
};

export const expireProductPromotionsAndSendNotifications = async () => {
  const now = new Date();
  const oneHourAhead = new Date(
    now.getTime() + PRODUCT_PROMOTION_REMINDER_HOURS * 60 * 60 * 1000,
  );

  const expiredRows = await ProductPromotionModel.find({
    status: PRODUCT_PROMOTION_STATUS_ACTIVE,
    activeUntil: { $lte: now },
  })
    .select("_id sellerId productId activeUntil")
    .lean();

  if (expiredRows.length > 0) {
    const expiredIds = expiredRows.map((row) => row._id);
    await ProductPromotionModel.updateMany(
      { _id: { $in: expiredIds } },
      { $set: { status: PRODUCT_PROMOTION_STATUS_EXPIRED } },
    );
    await Promise.all(
      expiredRows.map(async (row) => {
        await clearProductPromotionForProduct(row.productId);
        await createUserInAppNotification({
          userId: row.sellerId,
          kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_EXPIRED,
          message: "Продвижение товара завершилось",
          productId: row.productId,
        });
      }),
    );
  }

  const reminderRows = await ProductPromotionModel.find({
    status: PRODUCT_PROMOTION_STATUS_ACTIVE,
    activeUntil: { $gt: now, $lte: oneHourAhead },
    reminderSentAt: null,
  })
    .select("_id sellerId productId")
    .lean();

  if (reminderRows.length === 0) {
    return;
  }
  const reminderIds = reminderRows.map((row) => row._id);
  await ProductPromotionModel.updateMany(
    { _id: { $in: reminderIds }, reminderSentAt: null },
    { $set: { reminderSentAt: now } },
  );
  await Promise.all(
    reminderRows.map((row) =>
      createUserInAppNotification({
        userId: row.sellerId,
        kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_REMINDER,
        message: "Продвижение товара закончится примерно через 1 час",
        productId: row.productId,
      }),
    ),
  );
};

export const isProductCatalogPromotionActive = (product) => {
  if (!product?.catalogPromotionExpiresAt) {
    return false;
  }
  return new Date(product.catalogPromotionExpiresAt).getTime() > Date.now();
};
