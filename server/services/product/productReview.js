import {
  PRODUCT_REVIEW_LIMIT_DEFAULT,
  PRODUCT_REVIEW_LIMIT_MAX,
  PRODUCT_REVIEW_MESSAGES,
  PRODUCT_REVIEW_PAGE_DEFAULT,
  PRODUCT_REVIEW_STATUS_PUBLISHED,
} from "../../constants/productReviewConstants.js";
import { ProductModel, ProductReviewModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertCanSubmitProductReview,
  buildProductReviewSummary,
  canAccessProductReviews,
  isReviewEditable,
  normalizeReviewRating,
  normalizeReviewText,
  recalculateProductReviewAggregates,
  serializeProductReview,
} from "./productReviewHelpers.js";

const AUTHOR_PUBLIC_SELECT = "_id userName isUserDataConfirmed";

/**
 * @param {Record<string, unknown>} query
 */
export const parseReviewListPagination = (query) => {
  const page = Math.max(
    PRODUCT_REVIEW_PAGE_DEFAULT,
    Number(query.page) || PRODUCT_REVIEW_PAGE_DEFAULT,
  );
  const limit = Math.min(
    PRODUCT_REVIEW_LIMIT_MAX,
    Math.max(1, Number(query.limit) || PRODUCT_REVIEW_LIMIT_DEFAULT),
  );
  return { page, limit, skip: (page - 1) * limit };
};

const throwFieldError = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

const loadProductReviewAggregates = async (productId) => {
  const aggregates = await ProductModel.findById(productId)
    .select("averageRating reviewCount")
    .lean();

  return {
    averageRating: aggregates?.averageRating ?? 0,
    reviewCount: aggregates?.reviewCount ?? 0,
  };
};

/**
 * @param {{
 *   productId: string;
 *   viewerUserId: string | null;
 *   query: Record<string, unknown>;
 * }} input
 */
export async function listProductReviews({ productId, viewerUserId, query }) {
  const { page, limit, skip } = parseReviewListPagination(query);

  const product = await ProductModel.findById(productId)
    .select("productModerationStatus productSeller")
    .lean();

  if (!product) {
    throw new AppError(404, PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (!canAccessProductReviews(product, viewerUserId)) {
    throw new AppError(400, PRODUCT_REVIEW_MESSAGES.NOT_APPROVED);
  }

  const filter = {
    productId,
    status: PRODUCT_REVIEW_STATUS_PUBLISHED,
  };

  const [reviews, total] = await Promise.all([
    ProductReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
      .lean(),
    ProductReviewModel.countDocuments(filter),
  ]);

  return {
    reviews: reviews.map((row) => serializeProductReview(row)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

/**
 * @param {{
 *   productId: string;
 *   viewerUserId: string | null;
 * }} input
 */
export async function getProductReviewSummary({ productId, viewerUserId }) {
  try {
    return await buildProductReviewSummary(viewerUserId, productId);
  } catch (error) {
    if (error instanceof Error && error.message === PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND) {
      throw new AppError(404, error.message);
    }
    throw error;
  }
}

/**
 * @param {{
 *   authorUserId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function submitProductReview({ authorUserId, productId, body }) {
  let rating;
  let text;
  try {
    rating = normalizeReviewRating(body?.rating);
    text = normalizeReviewText(body?.text);
  } catch (validationError) {
    throwFieldError(validationError, "Некорректные данные отзыва");
  }

  try {
    await assertCanSubmitProductReview(authorUserId, productId);
  } catch (error) {
    throwFieldError(error, "Нельзя оставить отзыв");
  }

  const existing = await ProductReviewModel.findOne({
    productId,
    authorUserId,
  }).lean();

  if (existing) {
    throw new AppError(409, PRODUCT_REVIEW_MESSAGES.ALREADY_EXISTS);
  }

  try {
    const review = await ProductReviewModel.create({
      productId,
      authorUserId,
      rating,
      text,
    });

    await recalculateProductReviewAggregates(productId);

    const populated = await ProductReviewModel.findById(review._id)
      .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
      .lean();

    const aggregates = await loadProductReviewAggregates(productId);

    return {
      review: serializeProductReview(populated),
      ...aggregates,
      message: "Отзыв опубликован",
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, PRODUCT_REVIEW_MESSAGES.ALREADY_EXISTS);
    }
    throw error;
  }
}

/**
 * @param {{
 *   authorUserId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function patchMyProductReview({ authorUserId, productId, body }) {
  const review = await ProductReviewModel.findOne({
    productId,
    authorUserId,
  });

  if (!review) {
    throw new AppError(404, PRODUCT_REVIEW_MESSAGES.REVIEW_NOT_FOUND);
  }

  if (!isReviewEditable(review)) {
    throw new AppError(400, PRODUCT_REVIEW_MESSAGES.EDIT_WINDOW_EXPIRED);
  }

  if (body?.rating != null) {
    try {
      review.rating = normalizeReviewRating(body.rating);
    } catch (validationError) {
      throwFieldError(validationError, "Некорректная оценка");
    }
  }

  if (body?.text !== undefined) {
    try {
      review.text = normalizeReviewText(body.text);
    } catch (validationError) {
      throwFieldError(validationError, "Некорректный текст");
    }
  }

  await review.save();
  await recalculateProductReviewAggregates(productId);

  const populated = await ProductReviewModel.findById(review._id)
    .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
    .lean();

  const aggregates = await loadProductReviewAggregates(productId);

  return {
    review: serializeProductReview(populated),
    ...aggregates,
    message: "Отзыв обновлён",
  };
}

/**
 * @param {{
 *   authorUserId: string;
 *   productId: string;
 * }} input
 */
export async function deleteMyProductReview({ authorUserId, productId }) {
  const review = await ProductReviewModel.findOne({
    productId,
    authorUserId,
  });

  if (!review) {
    throw new AppError(404, PRODUCT_REVIEW_MESSAGES.REVIEW_NOT_FOUND);
  }

  if (!isReviewEditable(review)) {
    throw new AppError(400, PRODUCT_REVIEW_MESSAGES.EDIT_WINDOW_EXPIRED);
  }

  await review.deleteOne();
  await recalculateProductReviewAggregates(productId);

  const aggregates = await loadProductReviewAggregates(productId);

  return {
    ...aggregates,
    message: "Отзыв удалён",
  };
}
