import mongoose from "mongoose";

import {
  USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH,
  USERS_LOYALTY_RAFFLE_GOAL_DEFAULT,
  USERS_LOYALTY_RAFFLE_GOAL_MAX,
  USERS_LOYALTY_RAFFLE_GOAL_MIN,
  USERS_LOYALTY_RAFFLE_SETTINGS_KEY,
} from "../constants/usersLoyaltyRaffleSettingsConstants.js";

const UsersLoyaltyRaffleSettingsSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      required: true,
      unique: true,
      default: USERS_LOYALTY_RAFFLE_SETTINGS_KEY,
      enum: [USERS_LOYALTY_RAFFLE_SETTINGS_KEY],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH,
    },
    goal: {
      type: Number,
      default: USERS_LOYALTY_RAFFLE_GOAL_DEFAULT,
      min: USERS_LOYALTY_RAFFLE_GOAL_MIN,
      max: USERS_LOYALTY_RAFFLE_GOAL_MAX,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const UsersLoyaltyRaffleSettingsModel = mongoose.model(
  "UsersLoyaltyRaffleSettings",
  UsersLoyaltyRaffleSettingsSchema,
);
