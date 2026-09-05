import mongoose from "mongoose";

import {
  ESCROW_RELEASE_REASONS,
  ESCROW_STATE_HELD,
  ESCROW_STATES,
} from "../constants/escrowConstants.js";

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

    state: {
      type: String,
      enum: ESCROW_STATES,
      default: ESCROW_STATE_HELD,
      required: true,
      index: true,
    },

    /** Сколько всего пришло по этому отправлению: товары + доставка. */
    totalRub: { type: Number, required: true, min: 0 },
    goodsRub: { type: Number, required: true, min: 0 },
    deliveryRub: { type: Number, default: 0, min: 0 },

    /** Ставка снимком: сравнивать выплату надо с тем, что обещали. */
    commissionPercent: { type: Number, required: true, min: 0 },
    commissionRub: { type: Number, required: true, min: 0 },
    sellerRub: { type: Number, required: true, min: 0 },

    heldAt: { type: Date, default: Date.now },
    /**
     * Когда деньги уйдут продавцу сами, если покупатель промолчит.
     *
     * Ставится в момент вручения, а не оплаты: пока товар не доехал, отсчёт
     * не идёт и выплачивать нечего.
     */
    releaseDueAt: { type: Date, default: null, index: true },
    releasableAt: { type: Date, default: null },
    releaseReason: {
      type: String,
      enum: [...ESCROW_RELEASE_REASONS, null],
      default: null,
    },
    paidOutAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
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

/** Выборка cron'а: что пора размораживать по сроку. */
EscrowLedgerEntrySchema.index(
  { state: 1, releaseDueAt: 1 },
  { name: "escrow_due_for_release" },
);

export const EscrowLedgerEntryModel = mongoose.model(
  "EscrowLedgerEntry",
  EscrowLedgerEntrySchema,
);
