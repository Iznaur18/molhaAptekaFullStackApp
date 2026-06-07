import { loginBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const loginUserValidation = [validateBodyZod(loginBodySchema)];
