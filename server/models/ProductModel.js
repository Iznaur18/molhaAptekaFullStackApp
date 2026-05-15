import mongoose from "mongoose";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_IMAGE_URLS_MAX,
} from "../constants/productConstants.js";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: { type: String, required: true },
    productDescription: String,
    productImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) && value.length <= PRODUCT_IMAGE_URLS_MAX
          );
        },
        message: `Не более ${PRODUCT_IMAGE_URLS_MAX} изображений`,
      },
    },
    productPrice: { type: Number, required: true },
    productSeller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productCategory: {
      type: String,
      enum: PRODUCT_CATEGORY_VALUES,
      required: true,
    },
    productIsAvailable: {
      type: Boolean,
      default: true,
    },
    uniqueViewerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", ProductSchema);
