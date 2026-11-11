import {
  luckyBoxSellerIdParamsSchema,
  playLuckyBoxBodySchema,
  putLuckyBoxConfigBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const luckyBoxSellerIdParamValidation = [
  validateParamsZod(luckyBoxSellerIdParamsSchema),
];

export const playLuckyBoxValidation = [
  validateParamsZod(luckyBoxSellerIdParamsSchema),
  validateBodyZod(playLuckyBoxBodySchema),
];

export const putLuckyBoxConfigValidation = [
  validateBodyZod(putLuckyBoxConfigBodySchema),
];
