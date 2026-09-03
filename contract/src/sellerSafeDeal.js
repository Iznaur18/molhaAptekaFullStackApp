import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { optionalLimitQuery, optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/safeDealConstants.js`. */
export const SAFE_DEAL_MODERATION_NONE = "none";
export const SAFE_DEAL_MODERATION_PENDING = "pending";
export const SAFE_DEAL_MODERATION_APPROVED = "approved";
export const SAFE_DEAL_MODERATION_REJECTED = "rejected";

export const SAFE_DEAL_MODERATION_STATUSES = [
  SAFE_DEAL_MODERATION_NONE,
  SAFE_DEAL_MODERATION_PENDING,
  SAFE_DEAL_MODERATION_APPROVED,
  SAFE_DEAL_MODERATION_REJECTED,
];

/**
 * Правовая форма продавца.
 *
 * Самозанятых здесь нет намеренно: им запрещена перепродажа чужого товара, а
 * выплаты физлицу без статуса делают площадку налоговым агентом. Через
 * безопасную сделку деньги уходят только ИП и ООО.
 */
export const SELLER_LEGAL_FORM_NONE = "";
export const SELLER_LEGAL_FORM_IP = "ip";
export const SELLER_LEGAL_FORM_OOO = "ooo";

export const SELLER_LEGAL_FORMS = [SELLER_LEGAL_FORM_IP, SELLER_LEGAL_FORM_OOO];

export const SELLER_LEGAL_FORM_LABELS_RU = Object.freeze({
  [SELLER_LEGAL_FORM_IP]: "ИП",
  [SELLER_LEGAL_FORM_OOO]: "ООО",
});

/** У ИП ИНН физлица — 12 цифр, у организации — 10. */
export const SELLER_INN_LENGTH_BY_LEGAL_FORM = Object.freeze({
  [SELLER_LEGAL_FORM_IP]: 12,
  [SELLER_LEGAL_FORM_OOO]: 10,
});

export const SAFE_DEAL_MODERATION_COMMENT_MAX_LENGTH = 500;

const INN_10_WEIGHTS = [2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_12_WEIGHTS_11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_12_WEIGHTS_12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

/**
 * @param {number[]} digits
 * @param {number[]} weights
 */
const innControlDigit = (digits, weights) => {
  let sum = 0;
  for (let index = 0; index < weights.length; index += 1) {
    sum += digits[index] * weights[index];
  }
  return (sum % 11) % 10;
};

/**
 * Проверка ИНН по контрольной сумме.
 *
 * Одна опечатка в цифре ловится здесь, а не через месяц отказом выплаты, —
 * ради этого и считаем контрольную сумму, а не только длину.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidInn(value) {
  const raw = String(value ?? "").trim();
  if (!/^\d{10}$|^\d{12}$/.test(raw)) return false;

  const digits = [...raw].map(Number);
  if (digits.length === 10) {
    return innControlDigit(digits, INN_10_WEIGHTS) === digits[9];
  }
  return (
    innControlDigit(digits, INN_12_WEIGHTS_11) === digits[10] &&
    innControlDigit(digits, INN_12_WEIGHTS_12) === digits[11]
  );
}

/**
 * Подходит ли ИНН заявленной правовой форме.
 *
 * @param {string} legalForm
 * @param {unknown} inn
 * @returns {boolean}
 */
export function isInnLengthValidForLegalForm(legalForm, inn) {
  const expected = SELLER_INN_LENGTH_BY_LEGAL_FORM[legalForm];
  if (!expected) return false;
  return String(inn ?? "").trim().length === expected;
}

/**
 * Подключена ли продавцу безопасная сделка.
 *
 * Принимает и профиль пользователя, и продавца, приехавшего внутри товара:
 * наружу отдаётся только `sellerSafeDeal.moderationStatus`, без ИНН.
 *
 * @param {unknown} userLike
 * @returns {boolean}
 */
export function isSellerSafeDealApproved(userLike) {
  if (!userLike || typeof userLike !== "object") return false;
  const safeDeal = /** @type {{ sellerSafeDeal?: unknown }} */ (userLike).sellerSafeDeal;
  if (!safeDeal || typeof safeDeal !== "object") return false;
  return (
    /** @type {{ moderationStatus?: unknown }} */ (safeDeal).moderationStatus ===
    SAFE_DEAL_MODERATION_APPROVED
  );
}

export const SAFE_DEAL_INN_INVALID_MESSAGE = "ИНН введён с ошибкой — проверьте цифры";
export const SAFE_DEAL_INN_LENGTH_MESSAGE_IP = "У ИП ИНН из 12 цифр";
export const SAFE_DEAL_INN_LENGTH_MESSAGE_OOO = "У ООО ИНН из 10 цифр";

/** Body `POST /sellers/safe-deal/application`. */
export const safeDealApplicationBodySchema = z
  .object({
    legalForm: z.enum(
      /** @type {[string, ...string[]]} */ (SELLER_LEGAL_FORMS),
      { required_error: "Выберите форму: ИП или ООО" },
    ),
    inn: z
      .string({ required_error: "Укажите ИНН" })
      .trim()
      .min(1, "Укажите ИНН"),
  })
  .superRefine((value, ctx) => {
    if (!isInnLengthValidForLegalForm(value.legalForm, value.inn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inn"],
        message:
          value.legalForm === SELLER_LEGAL_FORM_IP
            ? SAFE_DEAL_INN_LENGTH_MESSAGE_IP
            : SAFE_DEAL_INN_LENGTH_MESSAGE_OOO,
      });
      return;
    }
    if (!isValidInn(value.inn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inn"],
        message: SAFE_DEAL_INN_INVALID_MESSAGE,
      });
    }
  });

/** Query `GET /staff/safe-deal` — очередь модерации. */
export const staffSafeDealListQuerySchema = z.object({
  status: z
    .enum([
      SAFE_DEAL_MODERATION_PENDING,
      SAFE_DEAL_MODERATION_APPROVED,
      SAFE_DEAL_MODERATION_REJECTED,
    ])
    .optional()
    .default(SAFE_DEAL_MODERATION_PENDING),
  page: optionalPageQuery,
  limit: optionalLimitQuery,
});

export const staffSafeDealParamsSchema = z.object({
  userId: mongoIdSchema,
});

/** Body `PATCH /staff/safe-deal/:userId/moderation`. */
export const staffSafeDealModerationBodySchema = z.object({
  nextStatus: z.enum([SAFE_DEAL_MODERATION_APPROVED, SAFE_DEAL_MODERATION_REJECTED], {
    required_error: "Заявку можно только одобрить или отклонить",
  }),
  comment: z
    .string()
    .trim()
    .max(SAFE_DEAL_MODERATION_COMMENT_MAX_LENGTH)
    .optional()
    .default(""),
});
