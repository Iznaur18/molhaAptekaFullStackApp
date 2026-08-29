import { userBlockListQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const userBlockListValidation = [validateQueryZod(userBlockListQuerySchema)];
