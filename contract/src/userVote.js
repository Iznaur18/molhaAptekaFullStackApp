import { z } from "zod";

export const USER_VOTE_VALUE_MIN = 1;
export const USER_VOTE_VALUE_MAX = 10;

export const voteBodySchema = z.object({
  userVoteValueClient: z.coerce
    .number({ required_error: "Значение голоса обязательно" })
    .int("Оценка должна быть целым числом от 1 до 10")
    .min(USER_VOTE_VALUE_MIN, "Оценка должна быть целым числом от 1 до 10")
    .max(USER_VOTE_VALUE_MAX, "Оценка должна быть целым числом от 1 до 10"),
});
