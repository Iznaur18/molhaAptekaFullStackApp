import mongoose from "mongoose";

import {
  APP_INTRO_FADE_OUT_MS_DEFAULT,
  APP_INTRO_FALLBACK_HINT_DEFAULT,
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_DEFAULT,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
  APP_INTRO_MAX_MS_DEFAULT,
  APP_INTRO_MIN_MS_DEFAULT,
  APP_INTRO_SETTINGS_KEY,
} from "../constants/appIntroSettingsConstants.js";

const clearableMediaUrlSchema = {
  type: String,
  default: null,
  trim: true,
  maxlength: 2048,
};

const AppIntroSettingsSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      required: true,
      unique: true,
      default: APP_INTRO_SETTINGS_KEY,
      enum: [APP_INTRO_SETTINGS_KEY],
    },
    videoMp4Url: clearableMediaUrlSchema,
    videoWebmUrl: clearableMediaUrlSchema,
    posterUrl: clearableMediaUrlSchema,
    fallbackTitle: {
      type: String,
      default: APP_INTRO_FALLBACK_TITLE_DEFAULT,
      trim: true,
      maxlength: APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
    },
    fallbackHint: {
      type: String,
      default: APP_INTRO_FALLBACK_HINT_DEFAULT,
      trim: true,
      maxlength: APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
    },
    minMs: {
      type: Number,
      default: APP_INTRO_MIN_MS_DEFAULT,
      min: 0,
    },
    maxMs: {
      type: Number,
      default: APP_INTRO_MAX_MS_DEFAULT,
      min: 0,
    },
    fadeOutMs: {
      type: Number,
      default: APP_INTRO_FADE_OUT_MS_DEFAULT,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    prioritizePlatformIntro: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const AppIntroSettingsModel = mongoose.model(
  "AppIntroSettings",
  AppIntroSettingsSchema,
);
