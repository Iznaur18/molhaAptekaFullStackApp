import mongoose from "mongoose";

/**
 * Включённость службы доставки, управляемая админом.
 *
 * До этого доступность была зашита константами, и выключить службу при аварии
 * можно было только деплоем. Константы остаются дефолтом: пока записи нет,
 * действует то, что написано в контракте.
 *
 * Регион (ЛОБО возит только по Чечне) — ограничение поверх включённости, и
 * живёт отдельно: включив службу, админ не должен внезапно показать её всей
 * стране.
 */
const shippingCarrierSettingSchema = new mongoose.Schema(
  {
    carrierId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
    /** Кто последним трогал — чтобы было с кого спросить. */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const ShippingCarrierSettingModel = mongoose.model(
  "ShippingCarrierSetting",
  shippingCarrierSettingSchema,
);
