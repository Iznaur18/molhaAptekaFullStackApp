import mongoose from "mongoose";

import {
  PRODUCT_ANSWER_TEXT_MAX_LENGTH,
  PRODUCT_QUESTION_STATUS_PENDING,
  PRODUCT_QUESTION_STATUSES,
  PRODUCT_QUESTION_TEXT_MAX_LENGTH,
} from "../constants/productQuestionConstants.js";

const ProductQuestionAnswerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: PRODUCT_ANSWER_TEXT_MAX_LENGTH,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answeredAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const ProductQuestionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: PRODUCT_QUESTION_TEXT_MAX_LENGTH,
    },
    answer: {
      type: ProductQuestionAnswerSchema,
      default: null,
    },
    status: {
      type: String,
      enum: PRODUCT_QUESTION_STATUSES,
      default: PRODUCT_QUESTION_STATUS_PENDING,
    },
    /** Дублируется из answer.answeredAt для сортировки «сначала отвеченные». */
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Публичная лента + очередь продавца (сначала отвеченные).
ProductQuestionSchema.index({ productId: 1, status: 1, answeredAt: -1 });
ProductQuestionSchema.index({ productId: 1, createdAt: -1 });
ProductQuestionSchema.index({ authorUserId: 1, createdAt: -1 });

export default mongoose.model("ProductQuestion", ProductQuestionSchema);
