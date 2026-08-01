import { voteBodySchema, voteTargetIdParamsSchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const voteTargetIdParamValidation = [
  validateParamsZod(voteTargetIdParamsSchema),
];

export const voteValidation = [validateBodyZod(voteBodySchema)];
