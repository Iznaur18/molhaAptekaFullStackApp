import mongoose from "mongoose";

import {
  PRICE_OFFER_STATUSES,
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../constants/productPriceOfferConstants.js";

const ProductPriceOfferSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: PRICE_OFFER_STATUSES,
      default: PRICE_OFFER_STATUS_PENDING,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    paymentDeadlineAt: {
      type: Date,
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
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

ProductPriceOfferSchema.index({ productId: 1, status: 1, offerPrice: -1 });
ProductPriceOfferSchema.index(
  { productId: 1, buyerUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: PRICE_OFFER_STATUS_PENDING },
  },
);
ProductPriceOfferSchema.index(
  { productId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: PRICE_OFFER_STATUS_ACCEPTED },
  },
);

export default mongoose.model("ProductPriceOffer", ProductPriceOfferSchema);
