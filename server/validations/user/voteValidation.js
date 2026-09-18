import {
  voteBodySchema,
  voteReceivedListQuerySchema,
  voteTargetIdParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const voteTargetIdParamValidation = [
  validateParamsZod(voteTargetIdParamsSchema),
];

export const voteValidation = [validateBodyZod(voteBodySchema)];

export const voteReceivedListValidation = [
  validateQueryZod(voteReceivedListQuerySchema),
];
