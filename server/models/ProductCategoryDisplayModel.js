import mongoose from "mongoose";

import { PRODUCT_CATEGORY_SLUG_MAX_LENGTH } from "../constants/productCategoryTreeConstants.js";

const ProductCategoryDisplaySchema = new mongoose.Schema(
  {
    categorySlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
    },
    customLabel: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProductCategoryDisplay", ProductCategoryDisplaySchema);
