import mongoose from "mongoose";

import {
  REFERRAL_LEDGER_ENTRY_TYPES,
  REFERRAL_SOURCE_KINDS,
} from "../constants/referralConstants.js";

/**
 * Append-only журнал партнёрских начислений / откатов / конвертаций.
 */
const ReferralLedgerEntrySchema = new mongoose.Schema(
  {
    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entryType: {
      type: String,
      enum: REFERRAL_LEDGER_ENTRY_TYPES,
      required: true,
    },
    sourceKind: {
      type: String,
      enum: REFERRAL_SOURCE_KINDS,
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    pointsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    partnerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    relatedCreditEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralLedgerEntry",
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ReferralLedgerEntrySchema.index(
  { sourceKind: 1, sourceId: 1, entryType: 1 },
  { unique: true },
);
ReferralLedgerEntrySchema.index({ referrerUserId: 1, createdAt: -1 });
ReferralLedgerEntrySchema.index(
  { relatedCreditEntryId: 1 },
  {
    unique: true,
    partialFilterExpression: { relatedCreditEntryId: { $type: "objectId" } },
  },
);

export default mongoose.model("ReferralLedgerEntry", ReferralLedgerEntrySchema);
