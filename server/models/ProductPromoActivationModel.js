import mongoose from "mongoose";

import { PRODUCT_PROMO_CODE_MAX_LENGTH } from "@molha/api-contract";

const { Schema } = mongoose;

/**
 * Одна активация промокода покупателем на товар (B2: второй код — отказ).
 * Счётчик на коде инкрементируется при создании этой записи.
 * После заказа со snapshot промокода запись удаляется (скидка не тянется в следующую корзину).
 */
const ProductPromoActivationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
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
      min: 1,
      max: 99,
    },
    promoCodeId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

ProductPromoActivationSchema.index(
  { userId: 1, productId: 1 },
  { unique: true, name: "promo_activation_user_product_unique" },
);

export default mongoose.model(
  "ProductPromoActivation",
  ProductPromoActivationSchema,
);
