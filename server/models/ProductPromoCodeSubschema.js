import mongoose from "mongoose";

import {
  PRODUCT_PROMO_CODE_MAX_LENGTH,
  PRODUCT_PROMO_CODES_MAX_ACTIVE,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MAX,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MIN,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MAX,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MIN,
} from "@molha/api-contract";

const { Schema } = mongoose;

const ProductPromoCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: PRODUCT_PROMO_CODE_MAX_LENGTH,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: PRODUCT_PROMO_DISCOUNT_PERCENT_MIN,
      max: PRODUCT_PROMO_DISCOUNT_PERCENT_MAX,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    maxActivations: {
      type: Number,
      required: true,
      min: PRODUCT_PROMO_MAX_ACTIVATIONS_MIN,
      max: PRODUCT_PROMO_MAX_ACTIVATIONS_MAX,
    },
    activationsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true },
);

export { ProductPromoCodeSchema, PRODUCT_PROMO_CODES_MAX_ACTIVE };
