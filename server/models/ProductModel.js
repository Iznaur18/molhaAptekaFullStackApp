import mongoose from "mongoose";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../constants/productConstants.js";
import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
} from "../constants/productCharacteristicsConstants.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_STATUSES,
} from "../constants/productModerationConstants.js";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: { type: String, required: true },
    productSearchBlob: {
      type: String,
      default: "",
      trim: true,
    },
    productDescription: {
      type: String,
      trim: true,
      maxlength: PRODUCT_DESCRIPTION_MAX_CHARS,
    },
    productCharacteristics: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
          },
          value: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
          },
        },
      ],
      default: [],
    },
    productImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length <= PRODUCT_IMAGE_URLS_MAX;
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
    productCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
      index: true,
    },
    categoryPathIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    categoryBreadcrumbRu: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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
    soldQuantity: {
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
      ref: "Raffle",
      default: null,
      index: true,
    },
    raffleParticipationEnabledAt: {
      type: Date,
      default: null,
    },
    productInstallmentEnabled: {
      type: Boolean,
      default: false,
    },
    loyaltyPointsPerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ productSearchBlob: 1 });
ProductSchema.index({ categoryPathIds: 1 });

/** GET /product — одобренные, в наличии, сортировка по дате / бусту. */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productIsAvailable: 1,
    productStockQuantity: 1,
    catalogPromotionActivatedAt: -1,
    catalogPromotionExpiresAt: -1,
    createdAt: -1,
  },
  { name: "catalog_approved_list" },
);

/** Каталог по подкатегории (`productCategoryId` $in). */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productCategoryId: 1,
    productIsAvailable: 1,
    createdAt: -1,
  },
  { name: "catalog_approved_category" },
);

/** GET /product/moderation/pending — FIFO. */
ProductSchema.index(
  { productModerationStatus: 1, createdAt: 1 },
  { name: "moderation_status_created_asc" },
);

/** GET /product/my — товары продавца. */
ProductSchema.index(
  { productSeller: 1, productModerationStatus: 1, createdAt: -1 },
  { name: "seller_moderation_created" },
);

/** Каталог sort=purchases — без $lookup orders. */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productIsAvailable: 1,
    productStockQuantity: 1,
    soldQuantity: -1,
    createdAt: -1,
  },
  { name: "catalog_approved_sold_quantity" },
);

export default mongoose.model("Product", ProductSchema);
