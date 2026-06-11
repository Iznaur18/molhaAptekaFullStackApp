import mongoose from "mongoose";

import { CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH } from "../constants/curatedProductListConstants.js";

const CuratedProductListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH,
    },
    productIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

CuratedProductListSchema.index({ sortOrder: 1, createdAt: 1 });

export default mongoose.model("CuratedProductList", CuratedProductListSchema);
