import mongoose from "mongoose";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../constants/productConstants.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_STATUSES,
} from "../constants/productModerationConstants.js";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: { type: String, required: true },
    productDescription: {
      type: String,
      trim: true,
      maxlength: PRODUCT_DESCRIPTION_MAX_CHARS,
    },
    productImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) && value.length <= PRODUCT_IMAGE_URLS_MAX
          );
        },
        message: `Не более ${PRODUCT_IMAGE_URLS_MAX} изображений`,
      },
    },
    productPreviewVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    productPrice: { type: Number, required: true },
    productOldPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    productLastApprovedDiscountPercent: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    productSeller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productCategory: {
      type: String,
      enum: PRODUCT_CATEGORY_VALUES,
      required: true,
    },
    productIsAvailable: {
      type: Boolean,
      default: true,
    },
    productStockQuantity: {
      type: Number,
      default: 0,
      min: 0,
      max: 9999,
    },
    productAuctionEnabled: {
      type: Boolean,
      default: false,
    },
    productAuctionCompletedOnce: {
      type: Boolean,
      default: false,
    },
    productModerationStatus: {
      type: String,
      enum: PRODUCT_MODERATION_STATUSES,
      default: PRODUCT_MODERATION_APPROVED,
    },
    productModerationComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    uniqueViewerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    catalogPromotionActivatedAt: {
      type: Date,
      default: null,
    },
    catalogPromotionExpiresAt: {
      type: Date,
      default: null,
    },
    activeRaffleId: {
      type: Schema.Types.ObjectId,
      ref: 'Raffle',
      default: null,
      index: true,
    },
    raffleParticipationEnabledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", ProductSchema);
