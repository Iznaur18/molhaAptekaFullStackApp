import mongoose from "mongoose";

import { PRODUCT_MANAGE_TOGGLE_KEY_VALUES } from "../constants/productManageToggleDisplayConstants.js";

const ProductManageToggleDisplaySchema = new mongoose.Schema(
  {
    toggleKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: PRODUCT_MANAGE_TOGGLE_KEY_VALUES,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
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

export default mongoose.model(
  "ProductManageToggleDisplay",
  ProductManageToggleDisplaySchema,
);
