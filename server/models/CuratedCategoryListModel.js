import mongoose from "mongoose";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import {
  CURATED_CATEGORY_ITEM_KINDS,
  CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH,
} from "../constants/curatedCategoryListConstants.js";

const CuratedCategoryListItemSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: CURATED_CATEGORY_ITEM_KINDS,
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false },
);

const CuratedCategoryListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH,
    },
    regionCode: {
      type: String,
      trim: true,
      default: DEFAULT_VIEWER_REGION_CODE,
      index: true,
    },
    items: {
      type: [CuratedCategoryListItemSchema],
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

CuratedCategoryListSchema.index({ sortOrder: 1, createdAt: 1 });
CuratedCategoryListSchema.index({ regionCode: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model("CuratedCategoryList", CuratedCategoryListSchema);
