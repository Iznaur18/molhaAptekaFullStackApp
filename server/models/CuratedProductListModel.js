import mongoose from "mongoose";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH } from "../constants/curatedProductListConstants.js";

const CuratedProductListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH,
    },
    regionCode: {
      type: String,
      trim: true,
      default: DEFAULT_VIEWER_REGION_CODE,
      index: true,
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
CuratedProductListSchema.index({ regionCode: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model("CuratedProductList", CuratedProductListSchema);
