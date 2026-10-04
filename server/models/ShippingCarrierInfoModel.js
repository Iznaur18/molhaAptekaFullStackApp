import mongoose from "mongoose";

/**
 * Справка о службе доставки для покупателя и продавца: описание, график,
 * где работает, телефон, сайт. Заполняет админ — по API службы этого не отдают.
 *
 * Отдельно от `ShippingCarrierSetting`: там — «включена ли служба», и список
 * служб другой (СДЭК и Яндекс включает сам продавец, а справка нужна и по ним).
 */
const shippingCarrierInfoSchema = new mongoose.Schema(
  {
    carrierId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: { type: String, trim: true, default: "" },
    workHours: { type: String, trim: true, default: "" },
    coverage: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    /** Кто последним правил — чтобы было с кого спросить. */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const ShippingCarrierInfoModel = mongoose.model(
  "ShippingCarrierInfo",
  shippingCarrierInfoSchema,
);
