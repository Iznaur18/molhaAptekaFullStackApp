import mongoose from "mongoose";

import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";

import {
  ORDER_LINE_ITEM_QUANTITY_MIN,
  ORDER_PAYMENT_METHODS,
  ORDER_SCHEMA_VERSION,
  ORDER_STATUSES,
  ORDER_STATUS_PENDING,
} from "../constants/orderConstants.js";

const BuyerPassportShareSchema = new mongoose.Schema(
  {
    passport: {
      lastName: { type: String, required: true, trim: true, maxlength: 80 },
      firstName: { type: String, required: true, trim: true, maxlength: 80 },
      middleName: { type: String, trim: true, maxlength: 80, default: "" },
      birthDate: { type: Date, required: true },
      series: { type: String, required: true, trim: true, maxlength: 4 },
      number: { type: String, required: true, trim: true, maxlength: 6 },
      issuedBy: { type: String, required: true, trim: true, maxlength: 200 },
      issuedAt: { type: Date, required: true },
      departmentCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 7,
      },
    },
    passportSelfiePhotoUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false },
);

const OrderLineItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: ORDER_LINE_ITEM_QUANTITY_MIN,
    },
    unitPriceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
    productNameAtOrder: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS_PENDING,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    loyaltyPointsAwarded: {
      type: Boolean,
      default: false,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsPerUnitAtOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsReservedTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsReserveReleased: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const OrderSchema = new mongoose.Schema(
  {
    userBuyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderLineItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Заказ должен содержать хотя бы одну позицию",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    deliveryAddressFlat: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    deliveryAddressFiasId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ORDER_PAYMENT_METHODS,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS_PENDING,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: ORDER_SCHEMA_VERSION,
    },
    priceOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductPriceOffer",
      default: null,
    },
    installmentContractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstallmentContract",
      default: null,
    },
    /** Audit: buyer consented to share passport with seller (no PII values). */
    passportShareConsentAt: {
      type: Date,
      default: null,
    },
    /** Snapshot at installment checkout; cleared on cancel. */
    buyerPassportShare: {
      type: BuyerPassportShareSchema,
      default: null,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ userBuyerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

/** GET /order/sales, open-sales lookup, soldQuantity $lookup по productId. */
OrderSchema.index(
  { "items.productId": 1, createdAt: -1 },
  { name: "items_productId_created" },
);

export default mongoose.model("Order", OrderSchema);
