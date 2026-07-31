import {
  AffiliateLedgerEntryModel,
  ProductModel,
} from "../../models/index.js";
import {
  AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE,
  AFFILIATE_LEDGER_ENTRY_PAYOUT,
  AFFILIATE_LINE_STATUS_NONE,
  AFFILIATE_LINE_STATUS_PAID,
  AFFILIATE_LINE_STATUS_PENDING,
  AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD,
  AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM,
  AFFILIATE_PERCENT_MAX,
  AFFILIATE_PERCENT_MIN,
  computeAffiliatePayoutAmount,
} from "../../constants/affiliateConstants.js";
import { AppError } from "../../errors/AppError.js";
import { normalizeId } from "../order/orderItemStatusHelpers.js";
import {
  creditLoyaltyPoints,
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import { migrateAffiliateBudgetToLoyaltyPoints } from "./migrateAffiliateBudgetToLoyaltyPoints.js";

/**
 * Live-% с товара → debit свободных баллов продавца → credit баллов шареру.
 * Вызывать внутри txn confirm.
 *
 * @param {{
 *   order: import("mongoose").Document;
 *   targetItem: import("mongoose").Document;
 *   buyerId: string;
 *   session: import("mongoose").ClientSession;
 * }} input
 */
export async function settleAffiliatePayoutForOrderItem({
  order,
  targetItem,
  buyerId,
  session,
}) {
  const status = String(targetItem.affiliateStatus ?? AFFILIATE_LINE_STATUS_NONE);
  if (status === AFFILIATE_LINE_STATUS_PAID) {
    return { paid: Number(targetItem.affiliateAmount) || 0, skipped: true };
  }
  if (status !== AFFILIATE_LINE_STATUS_PENDING) {
    return { paid: 0, skipped: true };
  }

  const referrerUserId = normalizeId(targetItem.affiliateReferrerUserId);
  if (!referrerUserId) {
    targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_NONE;
    return { paid: 0, skipped: true };
  }

  const sellerId = normalizeId(
    targetItem.productId?.productSeller?._id ??
      targetItem.productId?.productSeller,
  );
  if (!sellerId) {
    throw new AppError(400, "Продавец позиции не найден");
  }

  if (referrerUserId === buyerId || referrerUserId === sellerId) {
    targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD;
    targetItem.affiliateAmount = 0;
    targetItem.affiliatePercentUsed = null;
    return { paid: 0, skipped: true };
  }

  const productId = normalizeId(
    targetItem.productId?._id ?? targetItem.productId,
  );
  const product = productId
    ? await ProductModel.findById(productId)
        .select("affiliateEnabled affiliatePercent")
        .session(session)
        .lean()
    : null;

  const enabled = product?.affiliateEnabled === true;
  let percent = Math.floor(Number(product?.affiliatePercent) || 0);
  if (percent < AFFILIATE_PERCENT_MIN || percent > AFFILIATE_PERCENT_MAX) {
    percent = 0;
  }

  if (!enabled || percent <= 0) {
    targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM;
    targetItem.affiliateAmount = 0;
    targetItem.affiliatePercentUsed = null;
    return { paid: 0, skipped: true };
  }

  const qty = Math.ceil(Number(targetItem.quantity) || 0);
  const unit = Math.floor(Number(targetItem.unitPriceAtOrder) || 0);
  const linePaid = unit * qty;
  const amount = computeAffiliatePayoutAmount(linePaid, percent);

  if (amount <= 0) {
    targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM;
    return { paid: 0, skipped: true };
  }

  const orderId = normalizeId(order._id);
  const itemId = normalizeId(targetItem._id);
  const sourceId = `affiliate_payout:${orderId}:${itemId}`;

  const existing = await AffiliateLedgerEntryModel.findOne({
    entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
    sourceId,
  })
    .session(session)
    .lean();

  if (existing) {
    targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_PAID;
    targetItem.affiliateAmount = Math.ceil(Number(existing.amount) || amount);
    targetItem.affiliatePercentUsed = percent;
    targetItem.affiliatePaidAt = existing.createdAt ?? new Date();
    return { paid: targetItem.affiliateAmount, skipped: true };
  }

  await migrateAffiliateBudgetToLoyaltyPoints(sellerId, session);

  try {
    await deductLoyaltyPoints({
      userId: sellerId,
      amount,
      session,
    });
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `${AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE} Нужно ${error.required}, доступно ${error.available}.`,
      );
    }
    throw error;
  }

  await creditLoyaltyPoints({
    userId: referrerUserId,
    amount,
    session,
  });

  await AffiliateLedgerEntryModel.create(
    [
      {
        sellerUserId: sellerId,
        affiliateUserId: referrerUserId,
        entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
        sourceId,
        amount,
        percentUsed: percent,
        orderId,
        orderItemId: itemId,
      },
    ],
    { session },
  );

  targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_PAID;
  targetItem.affiliateAmount = amount;
  targetItem.affiliatePercentUsed = percent;
  targetItem.affiliatePaidAt = new Date();

  return {
    paid: amount,
    skipped: false,
    referrerUserId,
    deferNotification: true,
  };
}
