import mongoose from "mongoose";

import {
  INTRO_AD_CAMPAIGN_OPEN_STATUSES,
  INTRO_AD_CAMPAIGN_STATUSES,
  INTRO_AD_CTA_TYPES,
  INTRO_AD_PRICE_POINTS,
} from "../constants/introAdCampaignConstants.js";
import {
  APP_INTRO_FADE_OUT_MS_DEFAULT,
  APP_INTRO_FALLBACK_HINT_DEFAULT,
  APP_INTRO_FALLBACK_TITLE_DEFAULT,
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
  APP_INTRO_MAX_MS_DEFAULT,
  APP_INTRO_MIN_MS_DEFAULT,
} from "../constants/appIntroSettingsConstants.js";

const clearableMediaUrlSchema = {
  type: String,
  default: null,
  trim: true,
  maxlength: 2048,
};

const IntroAdCampaignSchema = new mongoose.Schema(
  {
    advertiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: INTRO_AD_CAMPAIGN_STATUSES,
      required: true,
    },
    videoMp4Url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    videoWebmUrl: clearableMediaUrlSchema,
    posterUrl: clearableMediaUrlSchema,
    fallbackTitle: {
      type: String,
      default: APP_INTRO_FALLBACK_TITLE_DEFAULT,
      trim: true,
      maxlength: APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
    },
    fallbackHint: {
      type: String,
      default: APP_INTRO_FALLBACK_HINT_DEFAULT,
      trim: true,
      maxlength: APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
    },
    minMs: {
      type: Number,
      default: APP_INTRO_MIN_MS_DEFAULT,
      min: 0,
    },
    maxMs: {
      type: Number,
      default: APP_INTRO_MAX_MS_DEFAULT,
      min: 0,
    },
    fadeOutMs: {
      type: Number,
      default: APP_INTRO_FADE_OUT_MS_DEFAULT,
      min: 0,
    },
    amountPoints: {
      type: Number,
      default: INTRO_AD_PRICE_POINTS,
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
    scheduledStartAt: {
      type: Date,
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    activeUntil: {
      type: Date,
      default: null,
    },
    pausedAt: {
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
    ctaType: {
      type: String,
      enum: INTRO_AD_CTA_TYPES,
      default: null,
    },
  },
  { timestamps: true },
);

IntroAdCampaignSchema.index(
  { advertiserId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: INTRO_AD_CAMPAIGN_OPEN_STATUSES },
    },
  },
);
IntroAdCampaignSchema.index({ advertiserId: 1, status: 1 });
IntroAdCampaignSchema.index({ status: 1, createdAt: 1 });
IntroAdCampaignSchema.index({ status: 1, scheduledStartAt: 1 });
IntroAdCampaignSchema.index({ status: 1, activeUntil: 1 });

export const IntroAdCampaignModel = mongoose.model(
  "IntroAdCampaign",
  IntroAdCampaignSchema,
);
