import { z } from "zod";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

const emptyBodySchema = z.object({}).strict();

/** POST/PATCH без тела — отклоняет лишние поля в body. */
export const emptyBodyValidation = [validateBodyZod(emptyBodySchema)];
