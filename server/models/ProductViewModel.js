import mongoose from "mongoose";

const ProductViewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ProductViewSchema.index({ productId: 1, viewerUserId: 1 }, { unique: true });

export default mongoose.model("ProductView", ProductViewSchema);
