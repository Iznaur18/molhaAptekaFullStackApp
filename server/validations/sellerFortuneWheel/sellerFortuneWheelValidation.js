import {
  fortuneWheelSellerIdParamsSchema,
  putFortuneWheelConfigBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const fortuneWheelSellerIdParamValidation = [
  validateParamsZod(fortuneWheelSellerIdParamsSchema),
];

export const putFortuneWheelConfigValidation = [
  validateBodyZod(putFortuneWheelConfigBodySchema),
];
