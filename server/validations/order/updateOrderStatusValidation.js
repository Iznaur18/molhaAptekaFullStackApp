import {
  orderIdParamsSchema,
  updateOrderStatusBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const updateOrderStatusValidation = [
  validateParamsZod(orderIdParamsSchema),
  validateBodyZod(updateOrderStatusBodySchema),
];
