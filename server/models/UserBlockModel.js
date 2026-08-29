import mongoose from "mongoose";

const UserBlockSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

UserBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
UserBlockSchema.index({ blockerId: 1, createdAt: -1 });
UserBlockSchema.index({ blockedId: 1, blockerId: 1 });

export default mongoose.model("UserBlock", UserBlockSchema);
