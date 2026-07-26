import mongoose from "mongoose";

import {
  SELLER_PERSONAL_CATEGORY_OPEN_STATUSES,
  SELLER_PERSONAL_CATEGORY_STATUSES,
  SELLER_PERSONAL_CATEGORY_IMAGE_URL_MAX_LENGTH,
  SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH,
} from "../constants/sellerPersonalCategoryConstants.js";

const SellerPersonalCategoryCampaignSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerPersonalCategory",
      default: null,
    },
    status: {
      type: String,
      enum: SELLER_PERSONAL_CATEGORY_STATUSES,
      required: true,
    },
    labelRu: {
      type: String,
      required: true,
      trim: true,
      maxlength: SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: SELLER_PERSONAL_CATEGORY_IMAGE_URL_MAX_LENGTH,
    },
    regionCode: {
      type: String,
      trim: true,
      default: "RU-MOW",
      index: true,
    },
    tariffCode: {
      type: String,
      required: true,
      trim: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    amountPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    pointsReservedAt: {
      type: Date,
      default: null,
    },
    pointsChargedAt: {
      type: Date,
      default: null,
    },
    pointsReleasedAt: {
      type: Date,
      default: null,
    },
    approvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    activeUntil: {
      type: Date,
      default: null,
    },
    reminderSentAt1Day: {
      type: Date,
      default: null,
    },
    reminderSentAt1Hour: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

SellerPersonalCategoryCampaignSchema.index(
  { sellerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: SELLER_PERSONAL_CATEGORY_OPEN_STATUSES },
    },
  },
);
SellerPersonalCategoryCampaignSchema.index({ sellerId: 1, status: 1 });
SellerPersonalCategoryCampaignSchema.index({ status: 1, createdAt: 1 });
SellerPersonalCategoryCampaignSchema.index({ status: 1, activeUntil: 1 });

export const SellerPersonalCategoryCampaignModel = mongoose.model(
  "SellerPersonalCategoryCampaign",
  SellerPersonalCategoryCampaignSchema,
);
