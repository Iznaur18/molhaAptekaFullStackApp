import {
  answerProductQuestionBodySchema,
  askProductQuestionBodySchema,
  productQuestionIdParamsSchema,
  productQuestionsListQuerySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const askProductQuestionValidation = [
  validateBodyZod(askProductQuestionBodySchema),
];

export const answerProductQuestionValidation = [
  validateBodyZod(answerProductQuestionBodySchema),
];

export const productQuestionsListValidation = [
  validateQueryZod(productQuestionsListQuerySchema),
];

export const productQuestionIdParamValidation = [
  validateParamsZod(productQuestionIdParamsSchema),
];
