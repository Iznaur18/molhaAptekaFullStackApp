import {
  courierHandoverCodeBodySchema,
  courierShipmentParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const courierShipmentValidation = [
  validateParamsZod(courierShipmentParamsSchema),
];

export const courierHandoverCodeValidation = [
  validateParamsZod(courierShipmentParamsSchema),
  validateBodyZod(courierHandoverCodeBodySchema),
];
