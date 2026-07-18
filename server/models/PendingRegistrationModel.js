import mongoose from "mongoose";
import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";

/**
 * Заявка на регистрацию до подтверждения email.
 *
 * Аккаунт в `UserModel` создаётся только в `confirmPendingRegistration`;
 * брошенные заявки удаляет MongoDB по TTL-индексу `expiresAt`.
 * Уникальность email/userName/телефона заявка НЕ резервирует — проверка
 * идёт по реальным пользователям при создании и при подтверждении,
 * поэтому занять ник без подтверждения почты нельзя.
 */
const PendingRegistrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // одна активная заявка на email: повторная регистрация заменяет старую
      unique: true,
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
      default: null,
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
  },
  { timestamps: true },
);

// TTL: MongoDB удаляет просроченные заявки автоматически
PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistrationModel = mongoose.model(
  "PendingRegistration",
  PendingRegistrationSchema,
);
