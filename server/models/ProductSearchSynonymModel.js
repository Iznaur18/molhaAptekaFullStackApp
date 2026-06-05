import mongoose from "mongoose";

import { PRODUCT_CATEGORY_VALUES } from "../constants/productConstants.js";
import { PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH } from "../constants/productSearchSynonymConstants.js";

const Schema = mongoose.Schema;

const ProductSearchSynonymSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
    },
    categories: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((slug) => PRODUCT_CATEGORY_VALUES.includes(slug))
          );
        },
        message: "Укажите хотя бы одну валидную legacy-категорию",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProductSearchSynonym", ProductSearchSynonymSchema);
