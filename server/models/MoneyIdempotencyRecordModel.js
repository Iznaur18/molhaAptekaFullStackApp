import mongoose from "mongoose";

/**
 * Идемпотентность money-мутаций (premium / admin credit / order / …).
 * Уникальность: scope + actor + key.
 */
const moneyIdempotencyRecordSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    /** Сериализованный успешный ответ для duplicate replay. */
    resultJson: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

moneyIdempotencyRecordSchema.index(
  { scope: 1, actorUserId: 1, key: 1 },
  { unique: true },
);

export const MoneyIdempotencyRecordModel = mongoose.model(
  "MoneyIdempotencyRecord",
  moneyIdempotencyRecordSchema,
);
