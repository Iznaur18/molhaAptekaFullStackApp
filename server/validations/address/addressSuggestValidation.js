import { addressSuggestBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const addressSuggestValidation = [validateBodyZod(addressSuggestBodySchema)];
