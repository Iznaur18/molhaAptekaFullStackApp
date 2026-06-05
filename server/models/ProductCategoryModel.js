import mongoose from "mongoose";

import { PRODUCT_CATEGORY_VALUES } from "../constants/productConstants.js";
import {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
  PRODUCT_CATEGORY_TREE_MAX_DEPTH,
} from "../constants/productCategoryTreeConstants.js";

const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
    },
    labelRu: {
      type: String,
      required: true,
      trim: true,
      maxlength: PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    depth: {
      type: Number,
      required: true,
      min: 0,
      max: PRODUCT_CATEGORY_TREE_MAX_DEPTH,
    },
    pathSlugs: {
      type: [String],
      required: true,
      default: [],
    },
    pathIds: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
    },
    pathLabelRu: {
      type: [String],
      required: true,
      default: [],
    },
    searchKeywords: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length <= PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT
          );
        },
        message: `Не более ${PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT} ключевых слов`,
      },
    },
    isLeaf: {
      type: Boolean,
      required: true,
      default: false,
    },
    legacyProductCategory: {
      type: String,
      trim: true,
      enum: PRODUCT_CATEGORY_VALUES,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ProductCategorySchema.index({ parentId: 1, sortOrder: 1, labelRu: 1 });
ProductCategorySchema.index({ legacyProductCategory: 1 }, { sparse: true });
ProductCategorySchema.index({ isLeaf: 1 });

export default mongoose.model("ProductCategory", ProductCategorySchema);
