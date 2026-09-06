import mongoose from "mongoose";

import {
  ESCROW_LINE_KINDS,
  ESCROW_REFUND_REASONS,
  ESCROW_RELEASE_REASONS,
  ESCROW_STATE_HELD,
  ESCROW_STATES,
} from "../constants/escrowConstants.js";

/**
 * Одна строка журнала: деньги за конкретную позицию или за доставку.
 *
 * Состояние живёт здесь, а не на записи целиком. Позиции одного продавца
 * закрываются вразнобой — одну подтвердили, вторую вернули, третья ещё едет,
 * — и общее состояние на всё отправление означало бы, что первое же
 * подтверждение отдаёт продавцу деньги за неотгруженное.
 */
const EscrowLedgerLineSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ESCROW_LINE_KINDS,
      required: true,
    },
    /** Индекс позиции в `order.items`; у строки доставки — `null`. */
    itemIndex: {
      type: Number,
      default: null,
      min: 0,
    },

    state: {
      type: String,
      enum: ESCROW_STATES,
      default: ESCROW_STATE_HELD,
      required: true,
    },

    /** Сколько пришло по этой строке. Для товара — с учётом акции «N+1». */
    totalRub: { type: Number, required: true, min: 0 },
    /** Доля площадки. У доставки всегда 0: комиссия берётся только с товаров. */
    commissionRub: { type: Number, required: true, min: 0 },
    /** Доля продавца. Считается вычитанием, чтобы копейки всегда сходились. */
    sellerRub: { type: Number, required: true, min: 0 },

    /**
     * Когда деньги уйдут продавцу сами, если покупатель промолчит.
     *
     * Ставится в момент вручения этой позиции, а не оплаты: пока товар не
     * доехал, отсчёт не идёт и выплачивать нечего.
     */
    releaseDueAt: { type: Date, default: null },
    releasableAt: { type: Date, default: null },
    releaseReason: {
      type: String,
      enum: [...ESCROW_RELEASE_REASONS, null],
      default: null,
    },

    refundableAt: { type: Date, default: null },
    refundReason: {
      type: String,
      enum: [...ESCROW_REFUND_REASONS, null],
      default: null,
    },

    paidOutAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { _id: false },
);

/**
 * Журнал денег, лежащих на счёте площадки по чужим сделкам.
 *
 * Запись на отправление, а не на заказ: заказ сегодня одного продавца, но
 * делить деньги всё равно надо по продавцам — иначе при первом же смешанном
 * заказе журнал придётся переписывать.
 *
 * Суммы — снимок на момент оплаты. Продавец может завтра сменить ставку
 * комиссии или тариф доставки; к уже принятым деньгам это отношения не имеет.
 */
const EscrowLedgerEntrySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Платёж, которым эти деньги пришли. По нему же пойдёт возврат. */
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },

    /**
     * Сводка по строкам: самое незакрытое состояние среди них.
     *
     * Производное поле — держим ради дешёвых выборок и админских списков.
     * Решения принимаются по строкам, и только по ним.
     */
    state: {
      type: String,
      enum: ESCROW_STATES,
      default: ESCROW_STATE_HELD,
      required: true,
      index: true,
    },

    /** Деньги по строкам: позиции продавца плюс одна строка доставки. */
    lines: {
      type: [EscrowLedgerLineSchema],
      default: () => [],
    },

    /** Итоги снимком — суммы строк на момент открытия записи. */
    totalRub: { type: Number, required: true, min: 0 },
    goodsRub: { type: Number, required: true, min: 0 },
    deliveryRub: { type: Number, default: 0, min: 0 },

    /** Ставка снимком: сравнивать выплату надо с тем, что обещали. */
    commissionPercent: { type: Number, required: true, min: 0 },
    commissionRub: { type: Number, required: true, min: 0 },
    sellerRub: { type: Number, required: true, min: 0 },

    heldAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

/**
 * Одно отправление — одна запись.
 *
 * Уникальность здесь, а не в коде: повторный вебхук от провайдера иначе
 * создал бы второй журнал на те же деньги, и выплата ушла бы дважды.
 */
EscrowLedgerEntrySchema.index({ orderId: 1, sellerId: 1 }, { unique: true });

/** Выборка cron'а: какие строки пора размораживать по сроку. */
EscrowLedgerEntrySchema.index(
  { "lines.state": 1, "lines.releaseDueAt": 1 },
  { name: "escrow_line_due_for_release" },
);

export const EscrowLedgerEntryModel = mongoose.model(
  "EscrowLedgerEntry",
  EscrowLedgerEntrySchema,
);
