import mongoose from "mongoose";

import {
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_STATUSES,
  INSTALLMENT_MONTHS_MAX,
  INSTALLMENT_MONTHS_MIN,
  INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
  INSTALLMENT_PLANS_MAX,
} from "../constants/installmentConstants.js";

const InstallmentPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
    },
    monthsCount: {
      type: Number,
      required: true,
      min: INSTALLMENT_MONTHS_MIN,
      max: INSTALLMENT_MONTHS_MAX,
    },
    monthlyAmountRub: {
      type: Number,
      required: true,
      min: INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
    },
    firstPaymentRequiredNow: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const ProductInstallmentProgramSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: INSTALLMENT_MODERATION_STATUSES,
      default: INSTALLMENT_MODERATION_APPROVED,
    },
    moderationComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    plans: {
      type: [InstallmentPlanSchema],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length <= INSTALLMENT_PLANS_MAX;
        },
        message: `Не более ${INSTALLMENT_PLANS_MAX} планов`,
      },
    },
    wasEverApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

ProductInstallmentProgramSchema.index({ moderationStatus: 1, createdAt: 1 });
ProductInstallmentProgramSchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.model(
  "ProductInstallmentProgram",
  ProductInstallmentProgramSchema,
);
