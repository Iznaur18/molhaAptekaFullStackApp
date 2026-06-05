import mongoose from "mongoose";

import {
  INSTALLMENT_DISPUTE_STATUS_OPEN,
  INSTALLMENT_DISPUTE_STATUSES,
} from "../constants/installmentConstants.js";

const InstallmentDisputeSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstallmentContract",
      required: true,
    },
    openedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: INSTALLMENT_DISPUTE_STATUSES,
      default: INSTALLMENT_DISPUTE_STATUS_OPEN,
    },
    resolutionNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    resolvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

InstallmentDisputeSchema.index({ status: 1, createdAt: 1 });
InstallmentDisputeSchema.index({ contractId: 1, status: 1 });

export default mongoose.model("InstallmentDispute", InstallmentDisputeSchema);
