import mongoose from "mongoose";

import {
  ONEC_EXCHANGE_DIRECTIONS,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_LOG_ERROR_MAX_LENGTH,
} from "../constants/onecConstants.js";

const OneCExchangeLogSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    direction: {
      type: String,
      required: true,
      enum: ONEC_EXCHANGE_DIRECTIONS,
    },
    status: {
      type: String,
      required: true,
      enum: [ONEC_EXCHANGE_STATUS_SUCCESS, ONEC_EXCHANGE_STATUS_ERROR],
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_LOG_ERROR_MAX_LENGTH,
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    triggeredBy: {
      type: String,
      enum: ["cron", "manual", "order_create", "exchange"],
      default: "cron",
    },
  },
  { timestamps: true },
);

OneCExchangeLogSchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.model("OneCExchangeLog", OneCExchangeLogSchema);
