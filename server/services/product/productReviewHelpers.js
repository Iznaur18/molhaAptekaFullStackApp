import mongoose from "mongoose";

import { ORDER_STATUS_CONFIRMED } from "../../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_REVIEW_EDIT_WINDOW_MS,
  PRODUCT_REVIEW_MESSAGES,
  PRODUCT_REVIEW_RATING_MAX,
  PRODUCT_REVIEW_RATING_MIN,
  PRODUCT_REVIEW_STATUS_PUBLISHED,
  PRODUCT_REVIEW_TEXT_MAX_LENGTH,
} from "../../constants/productReviewConstants.js";
import {
  OrderModel,
  ProductModel,
  ProductReviewModel,
  UserModel,
} from "../../models/index.js";

const AUTHOR_PUBLIC_SELECT = "_id userName isUserDataConfirmed";

/**
 * @param {{ productSeller?: unknown } | null} product
 * @param {string | null | undefined} userId
 */
export const isProductSeller = (product, userId) =>
  userId != null &&
  product?.productSeller != null &&
  String(product.productSeller) === String(userId);

/**
 * @param {{ productModerationStatus?: string; productSeller?: unknown } | null} product
 * @param {string | null | undefined} viewerUserId
 */
export const canAccessProductReviews = (product, viewerUserId) => {
  if (product?.productModerationStatus === PRODUCT_MODERATION_APPROVED) {
    return true;
  }
  return isProductSeller(product, viewerUserId);
};

/**
 * @param {string} buyerUserId
 * @param {string} productId
 */
export const userHasConfirmedProductPurchase = async (buyerUserId, productId) => {
  if (!mongoose.isValidObjectId(buyerUserId) || !mongoose.isValidObjectId(productId)) {
    return false;
  }

  const buyerOid = new mongoose.Types.ObjectId(buyerUserId);
  const productOid = new mongoose.Types.ObjectId(productId);

  const order = await OrderModel.findOne({
    userBuyerId: buyerOid,
    items: {
      $elemMatch: {
        productId: productOid,
        status: ORDER_STATUS_CONFIRMED,
      },
    },
  })
    .select("_id")
    .lean();

  return order != null;
};

/**
 * @param {number} raw
 */
export const normalizeReviewRating = (raw) => {
  const rating = Number(raw);
  if (
    !Number.isInteger(rating) ||
    rating < PRODUCT_REVIEW_RATING_MIN ||
    rating > PRODUCT_REVIEW_RATING_MAX
  ) {
    throw new Error(
      `Оценка от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`,
    );
  }
  return rating;
};

/**
 * @param {unknown} raw
 */
export const normalizeReviewText = (raw) => {
  if (raw == null) {
    return "";
  }
  const text = String(raw).trim();
  if (text.length > PRODUCT_REVIEW_TEXT_MAX_LENGTH) {
    throw new Error(
      `Текст отзыва не длиннее ${PRODUCT_REVIEW_TEXT_MAX_LENGTH} символов`,
    );
  }
  return text;
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} review
 */
export const isReviewEditable = (review) => {
  const createdAt = review?.createdAt;
  if (!createdAt) {
    return false;
  }
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) {
    return false;
  }
  return Date.now() - createdMs <= PRODUCT_REVIEW_EDIT_WINDOW_MS;
};

/**
 * @param {string} productId
 */
export const recalculateProductReviewAggregates = async (productId) => {
  const rows = await ProductReviewModel.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: PRODUCT_REVIEW_STATUS_PUBLISHED,
      },
    },
    {
      $group: {
        _id: null,
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const reviewCount = rows[0]?.reviewCount ?? 0;
  const averageRating =
    reviewCount > 0 ? Math.round((Number(rows[0].averageRating) || 0) * 10) / 10 : 0;

  await ProductModel.findByIdAndUpdate(productId, {
    $set: { reviewCount, averageRating },
  });

  return { reviewCount, averageRating };
};

/**
 * @param {string} authorUserId
 * @param {string} productId
 */
export const assertCanSubmitProductReview = async (authorUserId, productId) => {
  const user = await UserModel.findById(authorUserId)
    .select("isUserDataConfirmed")
    .lean();

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (user.isUserDataConfirmed !== true) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.DATA_NOT_CONFIRMED);
  }

  const product = await ProductModel.findById(productId)
    .select("productSeller productModerationStatus")
    .lean();

  if (!product) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.NOT_APPROVED);
  }

  if (String(product.productSeller) === String(authorUserId)) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.OWN_PRODUCT);
  }

  const hasConfirmed = await userHasConfirmedProductPurchase(authorUserId, productId);
  if (!hasConfirmed) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.NOT_DELIVERED);
  }

  return product;
};

/**
 * @param {Record<string, unknown>} review
 * @param {Record<string, unknown> | null} [author]
 */
export const serializeProductReview = (review, author = null) => {
  const authorDoc =
    author ??
    (review.authorUserId && typeof review.authorUserId === "object"
      ? review.authorUserId
      : null);

  return {
    _id: String(review._id),
    productId: String(review.productId),
    rating: review.rating,
    text: review.text ?? "",
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    canEdit: isReviewEditable(review),
    author: authorDoc
      ? {
          _id: String(authorDoc._id),
          userName: authorDoc.userName ?? "",
          isUserDataConfirmed: authorDoc.isUserDataConfirmed === true,
        }
      : null,
  };
};

/**
 * @param {string | null | undefined} viewerUserId
 * @param {string} productId
 */
export const buildProductReviewSummary = async (viewerUserId, productId) => {
  const product = await ProductModel.findById(productId)
    .select("averageRating reviewCount productModerationStatus productSeller")
    .lean();

  if (!product) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (!canAccessProductReviews(product, viewerUserId)) {
    throw new Error(PRODUCT_REVIEW_MESSAGES.NOT_APPROVED);
  }

  const reviewCount = Number(product.reviewCount) || 0;
  const averageRating = Number(product.averageRating) || 0;

  let canReview = false;
  let myReview = null;

  if (viewerUserId && !isProductSeller(product, viewerUserId)) {
    const existing = await ProductReviewModel.findOne({
      productId,
      authorUserId: viewerUserId,
    })
      .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
      .lean();

    if (existing) {
      myReview = serializeProductReview(existing);
    } else if (product.productModerationStatus === PRODUCT_MODERATION_APPROVED) {
      try {
        await assertCanSubmitProductReview(viewerUserId, productId);
        canReview = true;
      } catch {
        canReview = false;
      }
    }
  }

  return {
    averageRating,
    reviewCount,
    canReview,
    myReview,
  };
};
