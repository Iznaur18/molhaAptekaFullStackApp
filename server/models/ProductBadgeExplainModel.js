import mongoose from "mongoose";

import { PRODUCT_BADGE_EXPLAIN_KEY_VALUES } from "../constants/productBadgeExplainConstants.js";

const ProductBadgeExplainSchema = new mongoose.Schema(
  {
    badgeKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: PRODUCT_BADGE_EXPLAIN_KEY_VALUES,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
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

export default mongoose.model("ProductBadgeExplain", ProductBadgeExplainSchema);
