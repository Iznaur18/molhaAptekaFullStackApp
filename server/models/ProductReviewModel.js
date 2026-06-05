import mongoose from "mongoose";

import {
  PRODUCT_REVIEW_RATING_MAX,
  PRODUCT_REVIEW_RATING_MIN,
  PRODUCT_REVIEW_STATUS_PUBLISHED,
  PRODUCT_REVIEW_STATUSES,
  PRODUCT_REVIEW_TEXT_MAX_LENGTH,
} from "../constants/productReviewConstants.js";

const ProductReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: PRODUCT_REVIEW_RATING_MIN,
      max: PRODUCT_REVIEW_RATING_MAX,
    },
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: PRODUCT_REVIEW_TEXT_MAX_LENGTH,
    },
    status: {
      type: String,
      enum: PRODUCT_REVIEW_STATUSES,
      default: PRODUCT_REVIEW_STATUS_PUBLISHED,
    },
  },
  { timestamps: true },
);

ProductReviewSchema.index({ productId: 1, createdAt: -1 });
ProductReviewSchema.index({ productId: 1, authorUserId: 1 }, { unique: true });
ProductReviewSchema.index({ authorUserId: 1, createdAt: -1 });

export default mongoose.model("ProductReview", ProductReviewSchema);
