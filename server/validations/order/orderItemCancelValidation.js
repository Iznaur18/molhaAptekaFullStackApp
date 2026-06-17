import {
  orderItemActionParamsSchema,
  orderItemCancelBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const orderItemCancelValidation = [
  validateParamsZod(orderItemActionParamsSchema),
  validateBodyZod(orderItemCancelBodySchema),
];
