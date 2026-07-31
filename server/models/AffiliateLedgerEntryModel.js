import mongoose from "mongoose";

import { AFFILIATE_LEDGER_ENTRY_TYPES } from "../constants/affiliateConstants.js";

/**
 * Журнал бюджета партнёрки: пополнение / выплата шареру / reverse.
 */
const AffiliateLedgerEntrySchema = new mongoose.Schema(
  {
    sellerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    affiliateUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    entryType: {
      type: String,
      enum: AFFILIATE_LEDGER_ENTRY_TYPES,
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentUsed: {
      type: Number,
      default: null,
      min: 0,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedPayoutEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AffiliateLedgerEntry",
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AffiliateLedgerEntrySchema.index(
  { entryType: 1, sourceId: 1 },
  { unique: true },
);
AffiliateLedgerEntrySchema.index({ affiliateUserId: 1, createdAt: -1 });
AffiliateLedgerEntrySchema.index({ sellerUserId: 1, createdAt: -1 });

export default mongoose.model("AffiliateLedgerEntry", AffiliateLedgerEntrySchema);
