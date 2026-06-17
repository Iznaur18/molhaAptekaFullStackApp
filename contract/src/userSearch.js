import { z } from "zod";

import { optionalTrimmedString } from "./queryHelpers.js";
import { USER_ROLE_VALUES } from "./userProfile.js";

/** Синхрон с `server/validations/user/userSearchValidation.js`. */
export const USER_SEARCH_QUERY_MAX_LENGTH = 50;

/** Минимум символов в search, если поле передано (без полного листинга при фильтре). */
export const USER_SEARCH_MIN_LENGTH = 3;

/**
 * @param {unknown} search
 * @returns {boolean}
 */
export function canFetchUsersSearch(search) {
  const normalized = String(search ?? "").trim();
  return normalized.length === 0 || normalized.length >= USER_SEARCH_MIN_LENGTH;
}

/**
 * @param {unknown} search
 * @returns {boolean}
 */
export function isUsersSearchInputTooShort(search) {
  const normalized = String(search ?? "").trim();
  return normalized.length > 0 && normalized.length < USER_SEARCH_MIN_LENGTH;
}

export const userSearchQuerySchema = z.object({
  search: optionalTrimmedString
    .refine(
      (value) => value === undefined || value.length >= USER_SEARCH_MIN_LENGTH,
      `search не короче ${USER_SEARCH_MIN_LENGTH} символов`,
    )
    .refine(
      (value) => value === undefined || value.length <= USER_SEARCH_QUERY_MAX_LENGTH,
      `search не более ${USER_SEARCH_QUERY_MAX_LENGTH} символов`,
    ),
  page: z.coerce.number().int().min(1, "page должен быть целым числом от 1").optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100, "limit должен быть целым числом от 1 до 100")
    .optional(),
  userRole: z
    .enum(USER_ROLE_VALUES, {
      errorMap: () => ({ message: "userRole должен быть user, admin или moderator" }),
    })
    .optional(),
});
