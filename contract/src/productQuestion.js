import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/productQuestionConstants.js`. */
export const PRODUCT_QUESTION_TEXT_MAX_LENGTH = 300;
export const PRODUCT_ANSWER_TEXT_MAX_LENGTH = 300;
export const PRODUCT_QUESTIONS_MAX_PER_PRODUCT = 50;
export const PRODUCT_QUESTION_LIMIT_DEFAULT = 20;
export const PRODUCT_QUESTION_LIMIT_MAX = 50;

export const PRODUCT_QUESTION_STATUS_PENDING = "pending";
export const PRODUCT_QUESTION_STATUS_ANSWERED = "answered";
export const PRODUCT_QUESTION_STATUS_HIDDEN = "hidden";

/** @type {readonly ["pending", "answered", "hidden"]} */
export const PRODUCT_QUESTION_STATUSES = [
  PRODUCT_QUESTION_STATUS_PENDING,
  PRODUCT_QUESTION_STATUS_ANSWERED,
  PRODUCT_QUESTION_STATUS_HIDDEN,
];

const questionTextSchema = z
  .string({ invalid_type_error: "text должен быть строкой" })
  .trim()
  .min(1, "Введите вопрос")
  .max(
    PRODUCT_QUESTION_TEXT_MAX_LENGTH,
    `Вопрос не длиннее ${PRODUCT_QUESTION_TEXT_MAX_LENGTH} символов`,
  );

const answerTextSchema = z
  .string({ invalid_type_error: "text должен быть строкой" })
  .trim()
  .min(1, "Введите ответ")
  .max(
    PRODUCT_ANSWER_TEXT_MAX_LENGTH,
    `Ответ не длиннее ${PRODUCT_ANSWER_TEXT_MAX_LENGTH} символов`,
  );

export const askProductQuestionBodySchema = z.object({
  text: questionTextSchema,
});

export const answerProductQuestionBodySchema = z.object({
  text: answerTextSchema,
});

export const productQuestionsListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PRODUCT_QUESTION_LIMIT_MAX, `limit от 1 до ${PRODUCT_QUESTION_LIMIT_MAX}`)
    .optional()
    .default(PRODUCT_QUESTION_LIMIT_DEFAULT),
  /** Фильтр очереди продавца; покупателям игнорируется. */
  status: z
    .enum([PRODUCT_QUESTION_STATUS_PENDING, PRODUCT_QUESTION_STATUS_ANSWERED])
    .optional(),
});

export const productQuestionIdParamsSchema = z.object({
  productId: mongoIdSchema,
  questionId: mongoIdSchema,
});
