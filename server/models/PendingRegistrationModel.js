import mongoose from "mongoose";
import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";
import { MarketingAttributionSchema } from "./MarketingAttributionSubschema.js";

/**
 * Заявка на регистрацию до подтверждения email или SMS.
 *
 * Аккаунт в `UserModel` создаётся только в `confirmPendingRegistration`;
 * брошенные заявки удаляет MongoDB по TTL-индексу `expiresAt`.
 * Уникальность email/userName/телефона заявка НЕ резервирует — проверка
 * идёт по реальным пользователям при создании и при подтверждении.
 * Канал: `email` (upsert по email) или `phone` (upsert по телефону).
 */
const PendingRegistrationSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      // Одна активная заявка на email — индекс ниже.
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhoneNumber: {
      type: String,
      trim: true,
      // Без default: null — у заявки по почте поля просто нет. Одна активная
      // заявка на номер — индекс ниже.
    },
    userAvatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    userBackgroundUrl: {
      type: String,
      trim: true,
      default: "",
    },
    userBirthDate: {
      type: Date,
      default: null,
    },
    userGender: {
      type: String,
      enum: ["male", "female", "noSelected"],
      default: "noSelected",
    },
    notificationsEnabled: {
      type: Boolean,
      default: null,
    },
    userAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    userAddressFlat: {
      type: String,
      trim: true,
      default: "",
    },
    userAddressFiasId: {
      type: String,
      trim: true,
      default: "",
    },
    userAddressGeo: {
      type: {
        lat: { type: Number },
        lon: { type: Number },
      },
      _id: false,
      default: null,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    codeAttemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    /** Код реферера на момент заявки (применяется только при confirm). */
    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    /** Откуда пришёл (UTM, реферер) — переносится в пользователя при confirm. */
    marketingAttribution: {
      type: MarketingAttributionSchema,
      default: null,
    },
  },
  { timestamps: true },
);

// TTL: MongoDB удаляет просроченные заявки автоматически
PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Уникальность только среди заполненных значений. Раньше индексы были
// `sparse`, а sparse пропускает лишь ОТСУТСТВУЮЩЕЕ поле, не `null`: заявка по
// почте писала `userPhoneNumber: null`, и пока она висела (сутки), любая
// следующая регистрация по почте падала с E11000 (17.10.2026).
// syncCriticalIndexes пересоздаёт эти индексы при старте API.
PendingRegistrationSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } },
);
PendingRegistrationSchema.index(
  { userPhoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { userPhoneNumber: { $type: "string" } },
  },
);

export const PendingRegistrationModel = mongoose.model(
  "PendingRegistration",
  PendingRegistrationSchema,
);
