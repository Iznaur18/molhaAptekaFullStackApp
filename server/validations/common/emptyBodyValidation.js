import { z } from "zod";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

/** Axios/fetch часто шлют Content-Type JSON без тела → express оставляет `req.body` undefined. */
const emptyBodySchema = z.preprocess(
  (value) => (value == null ? {} : value),
  z.object({}).strict(),
);

/** POST/PATCH без тела — отклоняет лишние поля в body. */
export const emptyBodyValidation = [validateBodyZod(emptyBodySchema)];
