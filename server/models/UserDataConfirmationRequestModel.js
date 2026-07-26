import mongoose from "mongoose";

import {
  USER_DATA_CONFIRMATION_STATUSES,
  USER_DATA_CONFIRMATION_STATUS_PENDING,
} from "../constants/userDataConfirmationConstants.js";

/**
 * Plain passport snapshot или AES-GCM vault blob (`__vault: 1`).
 * Валидация plain — в `normalizePassportPayload` до `sealPassportPlain`.
 */
const UserDataConfirmationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    status: {
      type: String,
      enum: USER_DATA_CONFIRMATION_STATUSES,
      default: USER_DATA_CONFIRMATION_STATUS_PENDING,
    },
    staffNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
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

UserDataConfirmationRequestSchema.index({ status: 1, createdAt: 1 });
UserDataConfirmationRequestSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: USER_DATA_CONFIRMATION_STATUS_PENDING },
  },
);

export default mongoose.model(
  "UserDataConfirmationRequest",
  UserDataConfirmationRequestSchema,
);
