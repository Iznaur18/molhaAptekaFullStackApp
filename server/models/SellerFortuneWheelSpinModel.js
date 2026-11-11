import mongoose from "mongoose";

import {
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
  FORTUNE_WHEEL_DURATION_HOURS_MAX,
  FORTUNE_WHEEL_DURATION_HOURS_MIN,
  FORTUNE_WHEEL_RESULT_EMPTY,
  FORTUNE_WHEEL_RESULT_WIN,
  FORTUNE_WHEEL_SECTORS_MAX,
} from "../constants/sellerFortuneWheelConstants.js";

const Schema = mongoose.Schema;

const prizeSnapshotSchema = new Schema(
  {
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
    /** Товар-приз вместо скидки; null — обычная скидка. */
    prizeProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    prizeProductName: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

/**
 * Один спин покупателя за календарный день по МСК у конкретного продавца.
 * Спин в день один — уникальный индекс {sellerId, buyerId, dayKey} это
 * гарантирует независимо от гонок запросов.
 */
const SellerFortuneWheelSpinSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Календарный день спина по Europe/Moscow, формат YYYY-MM-DD. */
    dayKey: {
      type: String,
      required: true,
    },
    /** Индекс выпавшей секции (0..sectors.length-1 на момент спина). */
    sectorIndex: {
      type: Number,
      required: true,
      min: 0,
      max: FORTUNE_WHEEL_SECTORS_MAX - 1,
    },
    result: {
      type: String,
      enum: [FORTUNE_WHEEL_RESULT_WIN, FORTUNE_WHEEL_RESULT_EMPTY],
      required: true,
    },
    /** Снимок приза на момент спина; null при пустой секции. */
    prizeSnapshot: {
      type: prizeSnapshotSchema,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

SellerFortuneWheelSpinSchema.index(
  { sellerId: 1, buyerId: 1, dayKey: 1 },
  { unique: true },
);

export const SellerFortuneWheelSpinModel = mongoose.model(
  "SellerFortuneWheelSpin",
  SellerFortuneWheelSpinSchema,
);
