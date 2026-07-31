import mongoose from "mongoose";
import {
  SHIPPING_CARRIER_STATUS_MAX_LENGTH,
  SHIPPING_EXTERNAL_ID_MAX_LENGTH,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICE_TYPES,
  SHIPPING_TRACKING_NUMBER_MAX_LENGTH,
  SHIPPING_TRACKING_URL_MAX_LENGTH,
} from "@molha/api-contract";

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
    /** Plain snapshot или AES-GCM vault blob (`__vault: 1`). */
    passport: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
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
    /** Кто привёл покупателя по партнёрской ссылке объявления. */
    affiliateReferrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    affiliateStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "paid",
        "skipped_no_program",
        "skipped_antifraud",
      ],
      default: "none",
    },
    affiliateAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    affiliatePercentUsed: {
      type: Number,
      default: null,
      min: 0,
    },
    affiliatePaidAt: {
      type: Date,
      default: null,
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
    fulfillmentMethod: {
      type: String,
      required: true,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    /** Каркас под СДЭК / Яндекс / Почту; заполняется вручную / API позже. */
    shippingProvider: {
      type: String,
      default: null,
      validate: {
        validator: (value) =>
          value == null || SHIPPING_PROVIDERS.includes(value),
        message: "Неизвестный провайдер доставки",
      },
    },
    shippingServiceType: {
      type: String,
      default: null,
      validate: {
        validator: (value) =>
          value == null || SHIPPING_SERVICE_TYPES.includes(value),
        message: "Неизвестный тип доставки",
      },
    },
    shippingTrackingNumber: {
      type: String,
      trim: true,
      maxlength: SHIPPING_TRACKING_NUMBER_MAX_LENGTH,
      default: null,
    },
    shippingTrackingUrl: {
      type: String,
      trim: true,
      maxlength: SHIPPING_TRACKING_URL_MAX_LENGTH,
      default: null,
    },
    shippingExternalId: {
      type: String,
      trim: true,
      maxlength: SHIPPING_EXTERNAL_ID_MAX_LENGTH,
      default: null,
    },
    shippingCarrierStatus: {
      type: String,
      trim: true,
      maxlength: SHIPPING_CARRIER_STATUS_MAX_LENGTH,
      default: null,
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
