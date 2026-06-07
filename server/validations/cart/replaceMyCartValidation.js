import { replaceCartBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const replaceMyCartValidation = [validateBodyZod(replaceCartBodySchema)];
