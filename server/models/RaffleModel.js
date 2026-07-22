import mongoose from "mongoose";

import {
  RAFFLE_STATUSES,
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_TARGET_SALES_MAX,
  RAFFLE_TARGET_SALES_MIN,
  RAFFLE_DESCRIPTION_MAX_LENGTH,
  RAFFLE_TITLE_MAX_LENGTH,
  RAFFLE_PRIZE_MEDIA_TYPES,
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
} from "../constants/raffleConstants.js";
import {
  DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
  PROFILE_IMAGE_FOCUS_MAX,
  PROFILE_IMAGE_FOCUS_MIN,
} from "../constants/profileImageFocusConstants.js";

const Schema = mongoose.Schema;

const prizeImageFocusSchema = new Schema(
  {
    x: {
      type: Number,
      default: DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS.x,
      min: PROFILE_IMAGE_FOCUS_MIN,
      max: PROFILE_IMAGE_FOCUS_MAX,
    },
    y: {
      type: Number,
      default: DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS.y,
      min: PROFILE_IMAGE_FOCUS_MIN,
      max: PROFILE_IMAGE_FOCUS_MAX,
    },
  },
  { _id: false },
);

const RaffleSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: RAFFLE_TITLE_MAX_LENGTH,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: RAFFLE_DESCRIPTION_MAX_LENGTH,
    },
    prizeImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    prizeMediaType: {
      type: String,
      enum: RAFFLE_PRIZE_MEDIA_TYPES,
      default: RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
    },
    prizeVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    prizeImageFocus: {
      type: prizeImageFocusSchema,
      default: () => ({ ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }),
    },
    targetSales: {
      type: Number,
      required: true,
      min: RAFFLE_TARGET_SALES_MIN,
      max: RAFFLE_TARGET_SALES_MAX,
    },
    instagramUrl: {
      type: String,
      required: false,
      default: "",
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: RAFFLE_STATUSES,
      default: RAFFLE_STATUS_PENDING_STAFF,
      index: true,
    },
    salesProgress: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Уникальные покупатели (confirmed), не сумма quantity. */
    participantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    winnerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    winnerUserName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 64,
    },
    winnerUserAvatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    winnerSelectedAt: {
      type: Date,
      default: null,
    },
    moderationComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    approvedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    createPricePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    createPriceChargedAt: {
      type: Date,
      default: null,
    },
    createPriceRefundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

RaffleSchema.index({ status: 1, approvedAt: -1 });

export default mongoose.model("Raffle", RaffleSchema);
