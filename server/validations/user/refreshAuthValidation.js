import { refreshAuthBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const refreshAuthValidation = [validateBodyZod(refreshAuthBodySchema)];
