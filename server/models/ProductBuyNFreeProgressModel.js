import mongoose from "mongoose";

const ProductBuyNFreeProgressSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    completedPaidOrderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Заявка на бесплатную шт. в незавершённом заказе (анти-дабл). */
    freeClaimPending: {
      type: Boolean,
      default: false,
    },
    freeClaimOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

ProductBuyNFreeProgressSchema.index(
  { buyerId: 1, productId: 1 },
  { unique: true, name: "buy_n_free_buyer_product_unique" },
);

const ProductBuyNFreeProgressModel = mongoose.model(
  "ProductBuyNFreeProgress",
  ProductBuyNFreeProgressSchema,
);

export default ProductBuyNFreeProgressModel;
