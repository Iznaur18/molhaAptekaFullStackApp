import { createProductBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const makeProductValidation = [validateBodyZod(createProductBodySchema)];
