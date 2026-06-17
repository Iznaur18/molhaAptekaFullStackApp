import {
  deleteMyProductReview,
  getProductReviewSummary,
  listProductReviews,
  patchMyProductReview,
  submitProductReview,
} from "../../services/product/productReview.js";
import { successRes } from "../../services/http/index.js";

/** `GET /product/:productId/reviews` */
export const listProductReviewsController = async (req, res) => {
  const result = await listProductReviews({
    productId: req.params.productId,
    viewerUserId: req.userId ? String(req.userId) : null,
    query: req.query,
  });

  return successRes(res, result);
};

/** `GET /product/:productId/reviews/summary` */
export const getProductReviewSummaryController = async (req, res) => {
  const result = await getProductReviewSummary({
    productId: req.params.productId,
    viewerUserId: req.userId ? String(req.userId) : null,
  });

  return successRes(res, result);
};

/** `POST /product/:productId/reviews` */
export const submitProductReviewController = async (req, res) => {
  const result = await submitProductReview({
    authorUserId: String(req.userId),
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/reviews/me` */
export const patchMyProductReviewController = async (req, res) => {
  const result = await patchMyProductReview({
    authorUserId: String(req.userId),
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, result);
};

/** `DELETE /product/:productId/reviews/me` */
export const deleteMyProductReviewController = async (req, res) => {
  const result = await deleteMyProductReview({
    authorUserId: String(req.userId),
    productId: req.params.productId,
  });

  return successRes(res, result);
};
