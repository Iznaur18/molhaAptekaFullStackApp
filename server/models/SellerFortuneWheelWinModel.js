import mongoose from "mongoose";

import {
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
  FORTUNE_WHEEL_DURATION_HOURS_MAX,
  FORTUNE_WHEEL_DURATION_HOURS_MIN,
  FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
  FORTUNE_WHEEL_WIN_STATUSES,
} from "../constants/sellerFortuneWheelConstants.js";

const Schema = mongoose.Schema;

/**
 * Выигрыш покупателя в «Колесе фортуны»: скидка в процентах на заказ у
 * конкретного продавца, живёт до expiresAt. Применяется автоматически при
 * оформлении заказа (без промокодов), лучший процент на продавца.
 * Помечается used только внутри транзакции создания заказа.
 */
const SellerFortuneWheelWinSchema = new Schema(
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
      min: FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
      max: FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
    },
    durationHours: {
      type: Number,
      required: true,
      min: FORTUNE_WHEEL_DURATION_HOURS_MIN,
      max: FORTUNE_WHEEL_DURATION_HOURS_MAX,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: FORTUNE_WHEEL_WIN_STATUSES,
      default: FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
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
    spinId: {
      type: Schema.Types.ObjectId,
      ref: "SellerFortuneWheelSpin",
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

SellerFortuneWheelWinSchema.index({ buyerId: 1, sellerId: 1, status: 1, expiresAt: 1 });

export const SellerFortuneWheelWinModel = mongoose.model(
  "SellerFortuneWheelWin",
  SellerFortuneWheelWinSchema,
);
