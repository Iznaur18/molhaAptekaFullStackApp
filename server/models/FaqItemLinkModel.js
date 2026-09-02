import mongoose from "mongoose";

import { FAQ_ITEM_LINK_HREF_MAX_LENGTH } from "@molha/api-contract";

const FaqItemLinkSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 64,
    },
    href: {
      type: String,
      trim: true,
      maxlength: FAQ_ITEM_LINK_HREF_MAX_LENGTH,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("FaqItemLink", FaqItemLinkSchema);
