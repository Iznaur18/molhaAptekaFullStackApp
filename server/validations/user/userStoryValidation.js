import {
  createUserStoryBodySchema,
  resolveUserStoryReportsBodySchema,
  storyIdParamsSchema,
  submitUserStoryReportBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const userStoryIdParamValidation = [validateParamsZod(storyIdParamsSchema)];

export const createUserStoryValidation = [validateBodyZod(createUserStoryBodySchema)];

export const submitUserStoryReportValidation = [
  validateBodyZod(submitUserStoryReportBodySchema),
];

export const resolveUserStoryReportsValidation = [
  validateBodyZod(resolveUserStoryReportsBodySchema),
];
