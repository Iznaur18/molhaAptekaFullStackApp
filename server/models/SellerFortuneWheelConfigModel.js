import mongoose from "mongoose";

import {
  FORTUNE_WHEEL_CHANCE_PERCENT_MAX,
  FORTUNE_WHEEL_CHANCE_PERCENT_MIN,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
  FORTUNE_WHEEL_DURATION_HOURS_MAX,
  FORTUNE_WHEEL_DURATION_HOURS_MIN,
  FORTUNE_WHEEL_SECTORS_MAX,
  FORTUNE_WHEEL_SECTORS_MIN,
} from "../constants/sellerFortuneWheelConstants.js";

const { Schema } = mongoose;

const fortuneWheelSectorSchema = new Schema(
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
    chancePercent: {
      type: Number,
      required: true,
      min: FORTUNE_WHEEL_CHANCE_PERCENT_MIN,
      max: FORTUNE_WHEEL_CHANCE_PERCENT_MAX,
    },
    /** Выключенная секция — «пусто»: выпадает по шансу, но приза нет. */
    enabled: {
      type: Boolean,
      default: true,
    },
    /** Товар-приз вместо скидки; null — обычная скидка. */
    prizeProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { _id: false },
);

/**
 * Настройка «Колеса фортуны» продавца: 2–8 секций, у каждой своя скидка,
 * срок жизни приза и шанс выпадения (сумма шансов — 100%, проверяется
 * контрактом на входе). Выключенные секции — пустые.
 */
const SellerFortuneWheelConfigSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    sectors: {
      type: [fortuneWheelSectorSchema],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length >= FORTUNE_WHEEL_SECTORS_MIN &&
          value.length <= FORTUNE_WHEEL_SECTORS_MAX,
        message: `Секций: от ${FORTUNE_WHEEL_SECTORS_MIN} до ${FORTUNE_WHEEL_SECTORS_MAX}`,
      },
    },
    spinsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    winsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export const SellerFortuneWheelConfigModel = mongoose.model(
  "SellerFortuneWheelConfig",
  SellerFortuneWheelConfigSchema,
);
