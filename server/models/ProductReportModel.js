import mongoose from "mongoose";

import {
  PRODUCT_REPORT_STATUSES,
  PRODUCT_REPORT_STATUS_PENDING,
  PRODUCT_REPORT_TEXT_MAX_CHARS,
} from "../constants/productReportConstants.js";

const ProductReportSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportText: {
      type: String,
      required: true,
      trim: true,
      maxlength: PRODUCT_REPORT_TEXT_MAX_CHARS,
    },
    status: {
      type: String,
      enum: PRODUCT_REPORT_STATUSES,
      default: PRODUCT_REPORT_STATUS_PENDING,
    },
    staffNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ProductReportSchema.index({ status: 1, createdAt: 1 });
ProductReportSchema.index({ productId: 1, status: 1 });
ProductReportSchema.index(
  { productId: 1, reporterUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: PRODUCT_REPORT_STATUS_PENDING },
  },
);

export default mongoose.model("ProductReport", ProductReportSchema);
