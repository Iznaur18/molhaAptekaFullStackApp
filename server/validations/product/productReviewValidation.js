import {
  patchProductReviewBodySchema,
  productReviewsListQuerySchema,
  reviewIdParamsSchema,
  submitProductReviewBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const submitProductReviewValidation = [validateBodyZod(submitProductReviewBodySchema)];

export const patchProductReviewValidation = [validateBodyZod(patchProductReviewBodySchema)];

export const productReviewsListValidation = [validateQueryZod(productReviewsListQuerySchema)];

export const productReviewIdParamValidation = [validateParamsZod(reviewIdParamsSchema)];
