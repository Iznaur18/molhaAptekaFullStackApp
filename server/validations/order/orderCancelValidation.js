import {
  orderItemCancelBodySchema,
  orderShipmentParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const orderCancelValidation = [
  validateParamsZod(orderShipmentParamsSchema),
  validateBodyZod(orderItemCancelBodySchema),
];
