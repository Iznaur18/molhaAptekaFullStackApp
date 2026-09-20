import { cdekCredentialsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const cdekCredentialsValidation = [validateBodyZod(cdekCredentialsBodySchema)];
