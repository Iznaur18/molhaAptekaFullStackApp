import mongoose from "mongoose";

const ProductPromotionTariffSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    priceRub: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ProductPromotionTariffSchema.index({ isActive: 1, order: 1, durationHours: 1 });

export default mongoose.model("ProductPromotionTariff", ProductPromotionTariffSchema);
