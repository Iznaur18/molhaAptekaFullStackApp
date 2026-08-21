import mongoose from "mongoose";

import {
  SELLER_SHELF_MAX_PER_SELLER,
  SELLER_SHELF_NAME_MAX_CHARS,
} from "../constants/sellerShelfConstants.js";

const { Schema } = mongoose;

const SellerShelfSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: SELLER_SHELF_NAME_MAX_CHARS,
    },
    sortOrder: {
      type: Number,
      required: true,
      min: 0,
      max: SELLER_SHELF_MAX_PER_SELLER * 10,
      default: 0,
    },
  },
  { timestamps: true },
);

SellerShelfSchema.index({ sellerId: 1, sortOrder: 1 });
SellerShelfSchema.index({ sellerId: 1, name: 1 });

export const SellerShelfModel = mongoose.model("SellerShelf", SellerShelfSchema);
