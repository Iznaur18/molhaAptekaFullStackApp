import { userIdClientParamsSchema } from "@molha/api-contract";

import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const ratingUserIdParamValidation = [
  validateParamsZod(userIdClientParamsSchema),
];
