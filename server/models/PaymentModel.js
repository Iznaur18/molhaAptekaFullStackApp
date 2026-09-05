import mongoose from "mongoose";

import {
  PAYMENT_PURPOSES,
  PLATFORM_SERVICE_KINDS,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUSES,
} from "../constants/yookassaConstants.js";

/**
 * Наш собственный след каждого платежа.
 *
 * Провайдер держит деньги, но решение «что начислить» принимаем мы — и
 * принимаем ровно один раз. Поэтому у платежа есть свой статус и флаг
 * `appliedAt`: уведомление от ЮKassa приходит повторно при любой ошибке
 * доставки, и без этого флага баллы начислялись бы дважды.
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: PAYMENT_PURPOSES,
      required: true,
    },
    /** Сумма в рублях, как её видит покупатель. */
    amountRub: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: PAYMENT_STATUS_CREATED,
      index: true,
    },
    /** Заказ, если платёж — предоплата заказа. */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    /**
     * Какую услугу площадки оплачивает этот платёж и за что именно.
     *
     * Ссылка нетипизированная (`serviceKind` + `serviceTargetId`), потому
     * что услуги живут в разных коллекциях: продвижение, интро-реклама,
     * баннер. Заводить по полю на каждую — значит переписывать модель
     * платежа при каждой новой услуге.
     */
    serviceKind: {
      type: String,
      enum: [...PLATFORM_SERVICE_KINDS, null],
      default: null,
      index: true,
    },
    serviceTargetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    /** Идентификатор платежа в ЮKassa. */
    providerPaymentId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 64,
    },
    /** Ключ идемпотентности, с которым платёж создавался у провайдера. */
    idempotenceKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    /** Куда отправить пользователя после оплаты. */
    confirmationUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    /** Когда результат применён к балансу — защита от повторного начисления. */
    appliedAt: {
      type: Date,
      default: null,
    },
    /** Что именно начислено; для баллов — их количество. */
    appliedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    canceledReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true },
);

/** Уведомление приходит по id платежа — по нему и ищем. */
paymentSchema.index(
  { providerPaymentId: 1 },
  {
    unique: true,
    name: "payment_provider_id_unique",
    partialFilterExpression: { providerPaymentId: { $type: "string", $gt: "" } },
  },
);

/** Повторный клик «Оплатить» не должен плодить платежи. */
paymentSchema.index(
  { userId: 1, idempotenceKey: 1 },
  { unique: true, name: "payment_user_idempotence_unique" },
);

export const PaymentModel = mongoose.model("Payment", paymentSchema);
