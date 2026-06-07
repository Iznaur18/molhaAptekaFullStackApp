import { userSearchQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const userSearchValidation = [validateQueryZod(userSearchQuerySchema)];
