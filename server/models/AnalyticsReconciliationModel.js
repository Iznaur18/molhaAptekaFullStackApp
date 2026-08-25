import mongoose from "mongoose";

const MismatchSampleSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    expected: { type: Number, required: true },
    actual: { type: Number, required: true },
  },
  { _id: false },
);

/**
 * Snapshot последней сверки denorm vs primary (append по dayKey, upsert).
 */
const AnalyticsReconciliationSchema = new mongoose.Schema(
  {
    dayKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 16,
    },
    ranAt: {
      type: Date,
      required: true,
    },
    ok: {
      type: Boolean,
      required: true,
    },
    soldQuantityMismatches: {
      type: Number,
      required: true,
      min: 0,
    },
    uniqueViewerCountMismatches: {
      type: Number,
      required: true,
      min: 0,
    },
    productsChecked: {
      type: Number,
      required: true,
      min: 0,
    },
    soldMismatchSamples: {
      type: [MismatchSampleSchema],
      default: [],
    },
    viewerMismatchSamples: {
      type: [MismatchSampleSchema],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

AnalyticsReconciliationSchema.index({ ranAt: -1 });

export default mongoose.model(
  "AnalyticsReconciliation",
  AnalyticsReconciliationSchema,
);
