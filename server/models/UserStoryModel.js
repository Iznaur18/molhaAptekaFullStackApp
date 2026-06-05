import mongoose from "mongoose";

import {
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPES,
  USER_STORY_STATUS_ACTIVE,
  USER_STORY_STATUSES,
} from "../constants/userStoryConstants.js";

const UserStorySchema = new mongoose.Schema(
  {
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaType: {
      type: String,
      enum: USER_STORY_MEDIA_TYPES,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
      trim: true,
    },
    captionText: {
      type: String,
      default: "",
      trim: true,
      maxlength: USER_STORY_CAPTION_MAX_CHARS,
    },
    status: {
      type: String,
      enum: USER_STORY_STATUSES,
      default: USER_STORY_STATUS_ACTIVE,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    hiddenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

UserStorySchema.index({ status: 1, expiresAt: 1 });
UserStorySchema.index({ authorUserId: 1, status: 1, expiresAt: -1 });
UserStorySchema.index({ authorUserId: 1, publishedAt: -1 });

export default mongoose.model("UserStory", UserStorySchema);
