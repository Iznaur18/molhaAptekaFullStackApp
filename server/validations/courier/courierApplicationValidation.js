import {
  courierApplicationBodySchema,
  staffCourierListQuerySchema,
  staffCourierModerationBodySchema,
  staffCourierParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const courierApplicationValidation = [
  validateBodyZod(courierApplicationBodySchema),
];

export const staffCourierListValidation = [
  validateQueryZod(staffCourierListQuerySchema),
];

export const staffCourierModerationValidation = [
  validateParamsZod(staffCourierParamsSchema),
  validateBodyZod(staffCourierModerationBodySchema),
];
