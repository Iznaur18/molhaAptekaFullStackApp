import mongoose from "mongoose";

import {
  LUCKY_BOX_DISCOUNT_PERCENT_MAX,
  LUCKY_BOX_DISCOUNT_PERCENT_MIN,
  LUCKY_BOX_DURATION_HOURS_MAX,
  LUCKY_BOX_DURATION_HOURS_MIN,
  LUCKY_BOX_PRIZES_MAX,
} from "../constants/sellerLuckyBoxConstants.js";

const { Schema } = mongoose;

const luckyBoxPrizeSchema = new Schema(
  {
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
    /** Выключенный приз не участвует в раскладке, но сохраняется в конфиге. */
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
 * Настройка «Коробок удачи» продавца: 1–4 приза, каждый можно отдельно
 * выключить, остальные коробки пустые. Раскладка по коробкам
 * перемешивается на каждую попытку и в конфиге не хранится.
 */
const SellerLuckyBoxConfigSchema = new Schema(
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
    prizes: {
      type: [luckyBoxPrizeSchema],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.length <= LUCKY_BOX_PRIZES_MAX,
        message: `Призов не больше ${LUCKY_BOX_PRIZES_MAX}`,
      },
    },
    playsTotal: {
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

export const SellerLuckyBoxConfigModel = mongoose.model(
  "SellerLuckyBoxConfig",
  SellerLuckyBoxConfigSchema,
);
