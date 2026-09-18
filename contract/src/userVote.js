import { z } from "zod";

import { optionalPageQuery } from "./queryHelpers.js";

export const USER_VOTE_VALUE_MIN = 1;
export const USER_VOTE_VALUE_MAX = 10;

/** Лимит списка полученных голосов (`GET /vote/me/received`). */
export const USER_VOTE_RECEIVED_MAX_LIST_LIMIT = 50;

/** Размер страницы по умолчанию для `GET /vote/me/received`. */
export const USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT = 20;

export const voteBodySchema = z.object({
  userVoteValueClient: z.coerce
    .number({ required_error: "Значение голоса обязательно" })
    .int("Оценка должна быть целым числом от 1 до 10")
    .min(USER_VOTE_VALUE_MIN, "Оценка должна быть целым числом от 1 до 10")
    .max(USER_VOTE_VALUE_MAX, "Оценка должна быть целым числом от 1 до 10"),
});

export const voteReceivedListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(
      USER_VOTE_RECEIVED_MAX_LIST_LIMIT,
      `limit должен быть от 1 до ${USER_VOTE_RECEIVED_MAX_LIST_LIMIT}`,
    )
    .optional(),
});
