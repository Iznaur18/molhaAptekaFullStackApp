import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_QUESTION_DELETE_WINDOW_MS,
  PRODUCT_QUESTION_MESSAGES,
} from "../../constants/productQuestionConstants.js";

/**
 * @param {{ productSeller?: unknown } | null} product
 * @param {string | null | undefined} userId
 */
export const isProductSeller = (product, userId) =>
  userId != null &&
  product?.productSeller != null &&
  String(product.productSeller) === String(userId);

/**
 * Доступ к просмотру Q&A: продавцу — всегда; остальным — только на одобренный
 * товар с включённым тумблером.
 * @param {{ productModerationStatus?: string; productSeller?: unknown; productQaEnabled?: boolean } | null} product
 * @param {string | null | undefined} viewerUserId
 */
export const canAccessProductQuestions = (product, viewerUserId) => {
  if (isProductSeller(product, viewerUserId)) {
    return true;
  }
  return (
    product?.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
    product?.productQaEnabled === true
  );
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} question
 */
export const isQuestionDeletable = (question) => {
  const createdAt = question?.createdAt;
  if (!createdAt) {
    return false;
  }
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) {
    return false;
  }
  return Date.now() - createdMs <= PRODUCT_QUESTION_DELETE_WINDOW_MS;
};

/**
 * @param {Record<string, unknown>} question
 * @param {{ viewerUserId?: string | null }} [context]
 */
export const serializeProductQuestion = (question, context = {}) => {
  const { viewerUserId = null } = context;

  const authorDoc =
    question.authorUserId && typeof question.authorUserId === "object"
      ? question.authorUserId
      : null;

  const authorId = authorDoc ? String(authorDoc._id) : null;
  const isMine =
    viewerUserId != null && authorId != null && authorId === String(viewerUserId);

  const answer =
    question.answer && typeof question.answer === "object"
      ? {
          text: question.answer.text ?? "",
          answeredAt: question.answer.answeredAt ?? question.answeredAt ?? null,
        }
      : null;

  return {
    _id: String(question._id),
    productId: String(question.productId),
    text: question.text ?? "",
    status: question.status,
    answer,
    author: {
      _id: authorId,
      userName: authorDoc?.userName || PRODUCT_QUESTION_MESSAGES.DELETED_AUTHOR_NAME,
    },
    isMine,
    canDelete: isMine && isQuestionDeletable(question),
    createdAt: question.createdAt,
    answeredAt: question.answeredAt ?? null,
  };
};
