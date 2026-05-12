import mongoose from "mongoose";

import { PRODUCT_IMAGE_URLS_MAX } from "../constants/productConstants.js";

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
      enum: ["electronics", "clothing", "food", "figures"],
      required: true,
    },
    productIsAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", ProductSchema);
