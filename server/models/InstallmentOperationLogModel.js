import mongoose from "mongoose";

import {
  INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH,
  INSTALLMENT_OPERATION_ACTIONS,
} from "../constants/installmentConstants.js";

/**
 * Append-only журнал мутаций рассрочки.
 * `sourceId` уникален → повтор того же idempotencyKey не создаёт вторую запись.
 */
const InstallmentOperationLogSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstallmentContract",
      required: true,
    },
    action: {
      type: String,
      enum: INSTALLMENT_OPERATION_ACTIONS,
      required: true,
    },
    paymentIndex: {
      type: Number,
      default: null,
      min: 1,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH,
    },
    /** Уникальный ключ операции: action+contract+payment+actor+clientKey. */
    sourceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

InstallmentOperationLogSchema.index({ sourceId: 1 }, { unique: true });
InstallmentOperationLogSchema.index({ contractId: 1, createdAt: -1 });
InstallmentOperationLogSchema.index({ actorUserId: 1, createdAt: -1 });

export default mongoose.model(
  "InstallmentOperationLog",
  InstallmentOperationLogSchema,
);
