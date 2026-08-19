import mongoose from "mongoose";

import { PRODUCT_BULK_IMPORT_JOB_STATUSES } from "../constants/productBulkImportConstants.js";

const Schema = mongoose.Schema;

const ProductBulkImportJobSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: PRODUCT_BULK_IMPORT_JOB_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },
    totalRows: {
      type: Number,
      required: true,
      min: 1,
    },
    processedRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    rows: {
      type: Schema.Types.Mixed,
      required: true,
    },
    sellerPickup: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdProductIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    errorMessage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

ProductBulkImportJobSchema.index({ sellerId: 1, createdAt: -1 });

const ProductBulkImportJobModel =
  mongoose.models.ProductBulkImportJob ||
  mongoose.model("ProductBulkImportJob", ProductBulkImportJobSchema);

export default ProductBulkImportJobModel;
