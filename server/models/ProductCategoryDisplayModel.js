import mongoose from "mongoose";

import { PRODUCT_CATEGORY_SLUG_MAX_LENGTH } from "../constants/productCategoryTreeConstants.js";

const Schema = mongoose.Schema;

const ProductCategoryDisplaySchema = new Schema(
  {
    categorySlug: {
      type: String,
      trim: true,
      maxlength: PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

ProductCategoryDisplaySchema.index({ categorySlug: 1 }, { unique: true, sparse: true });
ProductCategoryDisplaySchema.index({ categoryId: 1 }, { unique: true, sparse: true });

ProductCategoryDisplaySchema.pre("validate", function validateCategoryDisplayKey(next) {
  const hasSlug =
    typeof this.categorySlug === "string" && this.categorySlug.trim().length > 0;
  const hasId = this.categoryId != null;

  if (hasSlug === hasId) {
    next(new Error("Укажите ровно одно из полей: categorySlug или categoryId"));
    return;
  }

  next();
});

export default mongoose.model("ProductCategoryDisplay", ProductCategoryDisplaySchema);
