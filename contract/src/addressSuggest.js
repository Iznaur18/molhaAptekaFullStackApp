import { z } from "zod";

import { ADDRESS_LINE_MAX_LENGTH } from "./userFields.js";

export const addressSuggestBodySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, `query от 2 до ${ADDRESS_LINE_MAX_LENGTH} символов`)
    .max(ADDRESS_LINE_MAX_LENGTH, `query от 2 до ${ADDRESS_LINE_MAX_LENGTH} символов`),
});
