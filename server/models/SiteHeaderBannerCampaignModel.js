import mongoose from "mongoose";

import {
  SITE_HEADER_BANNER_CAMPAIGN_OPEN_STATUSES,
  SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  SITE_HEADER_BANNER_CAMPAIGN_STATUSES,
} from "../constants/siteHeaderBannerCampaignConstants.js";

const clearableMediaUrlSchema = {
  type: String,
  default: null,
  trim: true,
  maxlength: 2048,
};

const SiteHeaderBannerCampaignSchema = new mongoose.Schema(
  {
    advertiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: SITE_HEADER_BANNER_CAMPAIGN_STATUSES,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    imageAlt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    linkPath: {
      type: String,
      default: null,
      trim: true,
      maxlength: 512,
    },
    backgroundColor: {
      type: String,
      default: null,
      trim: true,
      maxlength: 7,
    },
    regionCode: {
      type: String,
      trim: true,
      default: "RU-MOW",
      index: true,
    },
    amountPoints: {
      type: Number,
      default: SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
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

SiteHeaderBannerCampaignSchema.index(
  { advertiserId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: SITE_HEADER_BANNER_CAMPAIGN_OPEN_STATUSES },
    },
  },
);
SiteHeaderBannerCampaignSchema.index({ advertiserId: 1, status: 1 });
SiteHeaderBannerCampaignSchema.index({ status: 1, createdAt: 1 });
SiteHeaderBannerCampaignSchema.index({ status: 1, activeUntil: 1 });

export const SiteHeaderBannerCampaignModel = mongoose.model(
  "SiteHeaderBannerCampaign",
  SiteHeaderBannerCampaignSchema,
);
