import mongoose from "mongoose";

import {
  SELLER_PERSONAL_CATEGORY_IMAGE_URL_MAX_LENGTH,
  SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH,
} from "../constants/sellerPersonalCategoryConstants.js";

const SellerPersonalCategorySchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
    activeUntil: {
      type: Date,
      default: null,
    },
    activeCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerPersonalCategoryCampaign",
      default: null,
    },
  },
  { timestamps: true },
);

SellerPersonalCategorySchema.index({ activeUntil: 1 });

export const SellerPersonalCategoryModel = mongoose.model(
  "SellerPersonalCategory",
  SellerPersonalCategorySchema,
);
