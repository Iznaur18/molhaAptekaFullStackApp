import { z } from "zod";

import { optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/userFollowConstants.js`. */
export const USER_FOLLOW_MAX_LIST_LIMIT = 50;

export const userFollowListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(
      USER_FOLLOW_MAX_LIST_LIMIT,
      `limit должен быть от 1 до ${USER_FOLLOW_MAX_LIST_LIMIT}`,
    )
    .optional(),
});
