import {
  advanceShipmentStatusBodySchema,
  orderIdParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const advanceShipmentStatusValidation = [
  validateParamsZod(orderIdParamsSchema),
  validateBodyZod(advanceShipmentStatusBodySchema),
];
