import { body, param, query } from "express-validator";

import {
  PRODUCT_REVIEW_LIMIT_MAX,
  PRODUCT_REVIEW_RATING_MAX,
  PRODUCT_REVIEW_RATING_MIN,
  PRODUCT_REVIEW_TEXT_MAX_LENGTH,
} from "../../constants/productReviewConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const submitProductReviewValidation = [
  body("rating")
    .isInt({
      min: PRODUCT_REVIEW_RATING_MIN,
      max: PRODUCT_REVIEW_RATING_MAX,
    })
    .withMessage(
      `rating от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`,
    ),
  body("text")
    .optional({ values: "null" })
    .isString()
    .withMessage("text должен быть строкой")
    .isLength({ max: PRODUCT_REVIEW_TEXT_MAX_LENGTH })
    .withMessage(`text не длиннее ${PRODUCT_REVIEW_TEXT_MAX_LENGTH} символов`),
  handleValidationByExpressErrors,
];

export const patchProductReviewValidation = [
  body("rating")
    .optional()
    .isInt({
      min: PRODUCT_REVIEW_RATING_MIN,
      max: PRODUCT_REVIEW_RATING_MAX,
    })
    .withMessage(
      `rating от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`,
    ),
  body("text")
    .optional()
    .isString()
    .withMessage("text должен быть строкой")
    .isLength({ max: PRODUCT_REVIEW_TEXT_MAX_LENGTH })
    .withMessage(`text не длиннее ${PRODUCT_REVIEW_TEXT_MAX_LENGTH} символов`),
  handleValidationByExpressErrors,
];

export const productReviewsListValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: PRODUCT_REVIEW_LIMIT_MAX })
    .withMessage(`limit от 1 до ${PRODUCT_REVIEW_LIMIT_MAX}`),
  handleValidationByExpressErrors,
];

export const productReviewIdParamValidation = [
  param("reviewId").isMongoId().withMessage("Некорректный reviewId"),
  handleValidationByExpressErrors,
];
