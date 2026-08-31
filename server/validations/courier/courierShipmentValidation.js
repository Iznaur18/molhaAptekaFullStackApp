import {
  courierHandoverCodeBodySchema,
  courierOverviewQuerySchema,
  courierShipmentParamsSchema,
  shipmentDeliveryFeeBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const courierShipmentValidation = [
  validateParamsZod(courierShipmentParamsSchema),
];

export const courierHandoverCodeValidation = [
  validateParamsZod(courierShipmentParamsSchema),
  validateBodyZod(courierHandoverCodeBodySchema),
];

export const courierOverviewValidation = [
  validateQueryZod(courierOverviewQuerySchema),
];

export const shipmentDeliveryFeeValidation = [
  validateParamsZod(courierShipmentParamsSchema),
  validateBodyZod(shipmentDeliveryFeeBodySchema),
];
