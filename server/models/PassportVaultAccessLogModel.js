import mongoose from "mongoose";

import { PASSPORT_VAULT_ACCESS_PURPOSES } from "../constants/passportVaultConstants.js";

const PassportVaultAccessLogSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    purpose: {
      type: String,
      required: true,
      enum: PASSPORT_VAULT_ACCESS_PURPOSES,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    resourceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PassportVaultAccessLogSchema.index({ createdAt: -1 });
PassportVaultAccessLogSchema.index({ purpose: 1, createdAt: -1 });

export default mongoose.model(
  "PassportVaultAccessLog",
  PassportVaultAccessLogSchema,
);
