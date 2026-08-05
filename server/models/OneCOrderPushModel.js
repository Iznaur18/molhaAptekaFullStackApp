import mongoose from "mongoose";

import {
  ONEC_LOG_ERROR_MAX_LENGTH,
  ONEC_ORDER_PUSH_MAX_ATTEMPTS,
  ONEC_ORDER_PUSH_PENDING,
  ONEC_ORDER_PUSH_STATUSES,
} from "../constants/onecConstants.js";

/**
 * Очередь выгрузки заказа сайта → «Заказ покупателя» в 1С продавца.
 * Idempotency key: orderId + sellerId.
 */
const OneCOrderPushSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ONEC_ORDER_PUSH_STATUSES,
      default: ONEC_ORDER_PUSH_PENDING,
      index: true,
    },
    externalId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: ONEC_ORDER_PUSH_MAX_ATTEMPTS + 5,
    },
    lastError: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_LOG_ERROR_MAX_LENGTH,
    },
    syncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

OneCOrderPushSchema.index(
  { orderId: 1, sellerId: 1 },
  { unique: true, name: "onec_order_seller_unique" },
);
OneCOrderPushSchema.index(
  { status: 1, updatedAt: 1 },
  { name: "onec_order_push_status_updated" },
);

export default mongoose.model("OneCOrderPush", OneCOrderPushSchema);
