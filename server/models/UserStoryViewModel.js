import mongoose from "mongoose";

const UserStoryViewSchema = new mongoose.Schema(
  {
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

UserStoryViewSchema.index({ viewerUserId: 1, authorUserId: 1 }, { unique: true });
UserStoryViewSchema.index({ viewerUserId: 1, viewedAt: -1 });

export default mongoose.model("UserStoryView", UserStoryViewSchema);
