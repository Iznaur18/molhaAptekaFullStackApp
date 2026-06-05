import mongoose from "mongoose";

import { CATALOG_FEED_TILE_KEY_VALUES } from "../constants/catalogFeedTileConstants.js";

const ProductCatalogFeedTileDisplaySchema = new mongoose.Schema(
  {
    tileKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: CATALOG_FEED_TILE_KEY_VALUES,
    },
    customLabel: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
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
  "ProductCatalogFeedTileDisplay",
  ProductCatalogFeedTileDisplaySchema,
);
