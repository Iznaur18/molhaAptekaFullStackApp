import { z } from "zod";

import { optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/productReviewConstants.js`. */
export const PRODUCT_REVIEW_RATING_MIN = 1;
export const PRODUCT_REVIEW_RATING_MAX = 5;
export const PRODUCT_REVIEW_TEXT_MAX_LENGTH = 1000;
export const PRODUCT_REVIEW_LIMIT_DEFAULT = 20;
export const PRODUCT_REVIEW_LIMIT_MAX = 50;

const productReviewRatingSchema = z.coerce
  .number()
  .int(`rating от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`)
  .min(PRODUCT_REVIEW_RATING_MIN, `rating от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`)
  .max(PRODUCT_REVIEW_RATING_MAX, `rating от ${PRODUCT_REVIEW_RATING_MIN} до ${PRODUCT_REVIEW_RATING_MAX}`);

const optionalReviewTextSchema = z
  .union([z.string(), z.null()])
  .optional()
  .refine(
    (value) => value === undefined || value === null || value.length <= PRODUCT_REVIEW_TEXT_MAX_LENGTH,
    `text не длиннее ${PRODUCT_REVIEW_TEXT_MAX_LENGTH} символов`,
  );

export const submitProductReviewBodySchema = z.object({
  rating: productReviewRatingSchema,
  text: optionalReviewTextSchema,
});

export const patchProductReviewBodySchema = z.object({
  rating: productReviewRatingSchema.optional(),
  text: z
    .string({ invalid_type_error: "text должен быть строкой" })
    .max(PRODUCT_REVIEW_TEXT_MAX_LENGTH, `text не длиннее ${PRODUCT_REVIEW_TEXT_MAX_LENGTH} символов`)
    .optional(),
});

export const productReviewsListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PRODUCT_REVIEW_LIMIT_MAX, `limit от 1 до ${PRODUCT_REVIEW_LIMIT_MAX}`)
    .optional()
    .default(PRODUCT_REVIEW_LIMIT_DEFAULT),
});
