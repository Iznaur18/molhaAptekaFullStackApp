import { orderItemActionParamsSchema } from "@molha/api-contract";

import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const orderItemActionValidation = [
  validateParamsZod(orderItemActionParamsSchema),
];
