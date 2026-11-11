import mongoose from "mongoose";

import {
  LUCKY_BOX_DISCOUNT_PERCENT_MAX,
  LUCKY_BOX_DISCOUNT_PERCENT_MIN,
  LUCKY_BOX_DURATION_HOURS_MAX,
  LUCKY_BOX_DURATION_HOURS_MIN,
  LUCKY_BOX_WIN_STATUS_ACTIVE,
  LUCKY_BOX_WIN_STATUSES,
} from "../constants/sellerLuckyBoxConstants.js";

const Schema = mongoose.Schema;

/**
 * Выигрыш покупателя: скидка в процентах на заказ у конкретного
 * продавца, живёт до expiresAt. Применяется автоматически при
 * оформлении заказа (без промокодов), лучший процент на продавца.
 * Помечается used только внутри транзакции создания заказа.
 */
const SellerLuckyBoxWinSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: LUCKY_BOX_DISCOUNT_PERCENT_MIN,
      max: LUCKY_BOX_DISCOUNT_PERCENT_MAX,
    },
    durationHours: {
      type: Number,
      required: true,
      min: LUCKY_BOX_DURATION_HOURS_MIN,
      max: LUCKY_BOX_DURATION_HOURS_MAX,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: LUCKY_BOX_WIN_STATUSES,
      default: LUCKY_BOX_WIN_STATUS_ACTIVE,
      index: true,
    },
    usedInOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    playId: {
      type: Schema.Types.ObjectId,
      ref: "SellerLuckyBoxPlay",
      required: true,
    },
    /**
     * Товар-приз: выигрыш даёт 1 шт этого товара за 0 ₽ в заказе у
     * продавца ВМЕСТО скидки. null — обычный выигрыш-скидка.
     */
    prizeProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    /** Снимок названия на момент выигрыша — для витринных подписей. */
    prizeProductName: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

SellerLuckyBoxWinSchema.index({ buyerId: 1, sellerId: 1, status: 1, expiresAt: 1 });

export const SellerLuckyBoxWinModel = mongoose.model(
  "SellerLuckyBoxWin",
  SellerLuckyBoxWinSchema,
);
