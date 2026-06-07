import { userFollowListQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const userFollowListValidation = [validateQueryZod(userFollowListQuerySchema)];
