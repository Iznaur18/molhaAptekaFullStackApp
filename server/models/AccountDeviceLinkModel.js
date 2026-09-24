import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Два аккаунта, которые держали в одном браузере через «Добавить аккаунт».
 * Пользователю не показывается — сигнал для антифрода и модерации (накрутка
 * отзывов/голосов, покупки у самого себя). Пара хранится упорядоченно
 * (userIdLow < userIdHigh), чтобы A↔B и B↔A были одной записью.
 */
const AccountDeviceLinkSchema = new Schema(
  {
    userIdLow: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userIdHigh: { type: Schema.Types.ObjectId, ref: "User", required: true },
    firstSeenAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    seenCount: { type: Number, required: true, default: 1, min: 1 },
  },
  { timestamps: false },
);

AccountDeviceLinkSchema.index({ userIdLow: 1, userIdHigh: 1 }, { unique: true });
// Поиск всех связей аккаунта: по Low — префикс уникального индекса, по High — этот.
AccountDeviceLinkSchema.index({ userIdHigh: 1 });

export const AccountDeviceLinkModel = mongoose.model(
  "AccountDeviceLink",
  AccountDeviceLinkSchema,
);
