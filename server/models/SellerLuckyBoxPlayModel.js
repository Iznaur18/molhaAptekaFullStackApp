import mongoose from "mongoose";

import {
  LUCKY_BOX_ATTEMPTS_PER_DAY,
  LUCKY_BOX_BOXES_TOTAL,
  LUCKY_BOX_DISCOUNT_PERCENT_MAX,
  LUCKY_BOX_DISCOUNT_PERCENT_MIN,
  LUCKY_BOX_DURATION_HOURS_MAX,
  LUCKY_BOX_DURATION_HOURS_MIN,
  LUCKY_BOX_RESULT_EMPTY,
  LUCKY_BOX_RESULT_WIN,
  LUCKY_BOX_PRIZES_MAX,
  LUCKY_BOX_PRIZES_MIN,
} from "../constants/sellerLuckyBoxConstants.js";

const Schema = mongoose.Schema;

const prizeSnapshotSchema = new Schema(
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
 * Одна попытка покупателя за календарный день по МСК у конкретного
 * продавца. Попыток в день до LUCKY_BOX_ATTEMPTS_PER_DAY: вторая даётся,
 * только если первая была пустой. Уникальный индекс
 * {sellerId, buyerId, dayKey, attemptIndex} — железный лимит, который не
 * зависит от гонок запросов. Раскладка (layout) генерируется на первую
 * попытку и переиспользуется второй; клиенту она отдаётся только после
 * совершённой попытки.
 */
const SellerLuckyBoxPlaySchema = new Schema(
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
    /** Календарный день попытки по Europe/Moscow, формат YYYY-MM-DD. */
    dayKey: {
      type: String,
      required: true,
    },
    /** Порядковый номер попытки за день: 1..LUCKY_BOX_ATTEMPTS_PER_DAY. */
    attemptIndex: {
      type: Number,
      required: true,
      min: 1,
      max: LUCKY_BOX_ATTEMPTS_PER_DAY,
      default: 1,
    },
    /** Позиции коробок с призом (1..4 уникальных значения 0..5). */
    layout: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length >= LUCKY_BOX_PRIZES_MIN &&
          value.length <= LUCKY_BOX_PRIZES_MAX &&
          new Set(value).size === value.length &&
          value.every(
            (position) =>
              Number.isInteger(position) &&
              position >= 0 &&
              position < LUCKY_BOX_BOXES_TOTAL,
          ),
        message: "Раскладка: 1–4 уникальные коробки из 6",
      },
    },
    /**
     * Скидки (%) призов раскладки в том же порядке, что и layout:
     * layout[i] — коробка, layoutPrizePercents[i] — её скидка. Снимок на
     * момент первой попытки дня, чтобы раскрытие не зависело от правок
     * конфига продавца после игры.
     */
    layoutPrizePercents: {
      type: [Number],
      default: [],
    },
    /**
     * Товары-призы раскладки (снимок первой попытки): для каждой призовой
     * коробки — id и название товара, если призом был товар, а не скидка.
     */
    layoutPrizeProducts: {
      type: [
        new Schema(
          {
            boxIndex: { type: Number, required: true },
            prizeProductId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              default: null,
            },
            prizeProductName: { type: String, default: null },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    pickedBoxIndex: {
      type: Number,
      required: true,
      min: 0,
      max: LUCKY_BOX_BOXES_TOTAL - 1,
    },
    result: {
      type: String,
      enum: [LUCKY_BOX_RESULT_WIN, LUCKY_BOX_RESULT_EMPTY],
      required: true,
    },
    /** Снимок приза на момент игры; null при пустой коробке. */
    prizeSnapshot: {
      type: prizeSnapshotSchema,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

SellerLuckyBoxPlaySchema.index(
  { sellerId: 1, buyerId: 1, dayKey: 1, attemptIndex: 1 },
  { unique: true },
);

export const SellerLuckyBoxPlayModel = mongoose.model(
  "SellerLuckyBoxPlay",
  SellerLuckyBoxPlaySchema,
);
