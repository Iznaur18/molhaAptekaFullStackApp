import { z } from "zod";

import { optionalTrimmedString } from "./queryHelpers.js";
import { USER_ROLE_VALUES } from "./userProfile.js";

/** Синхрон с `server/validations/user/userSearchValidation.js`. */
export const USER_SEARCH_QUERY_MAX_LENGTH = 50;

export const userSearchQuerySchema = z.object({
  search: optionalTrimmedString.refine(
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
