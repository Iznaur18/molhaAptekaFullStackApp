import mongoose from "mongoose";

/** Сколько хранить отметки «кто смотрел сторис» (сторис живёт 24 ч). */
const USER_STORY_VIEWER_TTL_SEC = 7 * 24 * 60 * 60;

/**
 * Один зритель на один сторис — для счётчика просмотров у автора.
 * `UserStoryViewModel` — другое: пара «зритель + автор» для серого кольца в ленте.
 */
const UserStoryViewerSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStory",
      required: true,
    },
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

UserStoryViewerSchema.index({ storyId: 1, viewerUserId: 1 }, { unique: true });
UserStoryViewerSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: USER_STORY_VIEWER_TTL_SEC },
);

export default mongoose.model("UserStoryViewer", UserStoryViewerSchema);
