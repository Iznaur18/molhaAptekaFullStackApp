import {
  DEAL_REQUEST_COMMENT_MAX_LENGTH,
  DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH,
  DEAL_REQUEST_KINDS,
  DEAL_REQUEST_STATUS_PENDING,
  DEAL_REQUEST_STATUSES,
  ADDRESS_LINE_MAX_LENGTH,
} from "@molha/api-contract";
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Заявка по объявлению без корзины: осмотр авто или недвижимости, услуга.
 *
 * Денег здесь нет намеренно: стороны рассчитываются сами, площадка только
 * сводит их и помнит, чем кончилось.
 */
const DealRequestSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: DEAL_REQUEST_KINDS, required: true },
    status: {
      type: String,
      enum: DEAL_REQUEST_STATUSES,
      default: DEAL_REQUEST_STATUS_PENDING,
      required: true,
    },
    /**
     * Заявка ещё жива. Производное от `status`, хранится ради уникального
     * индекса ниже: условие «статус из списка» в частичном индексе понимают не
     * все версии MongoDB, а равенство булеву — все.
     */
    isOpen: { type: Boolean, default: true, required: true },

    /** Время, которое предложил покупатель. */
    preferredAt: { type: Date, required: true },
    /** Время, на котором сошлись; до ответа продавца пусто. */
    agreedAt: { type: Date, default: null },
    /** Итоговая цена услуги от исполнителя; у осмотра пусто. */
    quotedPriceRub: { type: Number, default: null, min: 1 },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: DEAL_REQUEST_COMMENT_MAX_LENGTH,
    },
    /** Куда приехать исполнителю услуги. */
    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    declineReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH,
    },

    /** До какого момента продавец может ответить; дальше заявка сгорает. */
    expiresAt: { type: Date, default: null },
    /** Когда услуга закроется сама, если клиент не подтвердит. */
    autoConfirmAt: { type: Date, default: null },

    // Снимок объявления: карточку могут переименовать или удалить, а в списке
    // заявок должно остаться, о чём договаривались.
    productNameAtRequest: { type: String, trim: true, default: "" },
    productImageUrlAtRequest: { type: String, trim: true, default: "" },
    productPriceRubAtRequest: { type: Number, default: null },
  },
  { timestamps: true },
);

DealRequestSchema.index({ buyerId: 1, createdAt: -1 });
DealRequestSchema.index({ sellerId: 1, createdAt: -1 });
// Одна живая заявка покупателя на объявление: двойной клик и повторная
// отправка формы не должны завалить продавца копиями.
DealRequestSchema.index(
  { buyerId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { isOpen: true } },
);
DealRequestSchema.index({ status: 1, expiresAt: 1 });
DealRequestSchema.index({ status: 1, autoConfirmAt: 1 });
DealRequestSchema.index({ productId: 1, isOpen: 1 });

export const DealRequestModel = mongoose.model("DealRequest", DealRequestSchema);
