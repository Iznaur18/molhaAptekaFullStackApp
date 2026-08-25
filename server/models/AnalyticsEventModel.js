import mongoose from "mongoose";

import {
  ANALYTICS_EVENT_IDEMPOTENCY_KEY_MAX,
  ANALYTICS_EVENT_TYPE_MAX,
  ANALYTICS_EVENT_TYPES,
} from "../constants/analyticsEventConstants.js";

/**
 * Append-only platform analytics events (Level 2 / Event Store).
 * Не UPDATE/DELETE бизнес-полей — только insert.
 */
const AnalyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ANALYTICS_EVENT_TYPES,
      maxlength: ANALYTICS_EVENT_TYPE_MAX,
    },
    /** Натуральный ключ идемпотентности (unique). */
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: ANALYTICS_EVENT_IDEMPOTENCY_KEY_MAX,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subjectType: {
      type: String,
      default: null,
      trim: true,
      maxlength: 64,
    },
    subjectId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    suspectedFraud: {
      type: Boolean,
      default: false,
    },
    fraudReasons: {
      type: [String],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AnalyticsEventSchema.index({ idempotencyKey: 1 }, { unique: true });
AnalyticsEventSchema.index({ eventType: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ actorUserId: 1, eventType: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ occurredAt: -1 });

export default mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
