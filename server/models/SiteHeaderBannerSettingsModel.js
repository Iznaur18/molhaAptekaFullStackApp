import mongoose from "mongoose";

import {
  SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH,
  SITE_HEADER_BANNER_ITEM_ID_MAX_LENGTH,
  SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH,
  SITE_HEADER_BANNER_SETTINGS_KEY,
} from "../constants/siteHeaderBannerConstants.js";

const clearableMediaUrlSchema = {
  type: String,
  default: null,
  trim: true,
  maxlength: 2048,
};

const SiteHeaderBannerItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      maxlength: SITE_HEADER_BANNER_ITEM_ID_MAX_LENGTH,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    imageUrl: clearableMediaUrlSchema,
    imageAlt: {
      type: String,
      default: "",
      trim: true,
      maxlength: SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH,
    },
    linkPath: {
      type: String,
      default: null,
      trim: true,
      maxlength: SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH,
    },
    backgroundColor: {
      type: String,
      default: null,
      trim: true,
      maxlength: 7,
    },
  },
  { _id: false },
);

const SiteHeaderBannerSettingsSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      required: true,
      unique: true,
      default: SITE_HEADER_BANNER_SETTINGS_KEY,
      enum: [SITE_HEADER_BANNER_SETTINGS_KEY],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    items: {
      type: [SiteHeaderBannerItemSchema],
      default: [],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const SiteHeaderBannerSettingsModel = mongoose.model(
  "SiteHeaderBannerSettings",
  SiteHeaderBannerSettingsSchema,
);
