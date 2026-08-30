import {
  getOneCImportJobsQuerySchema,
  getOneCLogsQuerySchema,
  putOneCCategoryMappingsBodySchema,
  putOneCSettingsBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const putOneCSettingsValidation = [
  validateBodyZod(putOneCSettingsBodySchema),
];

export const getOneCLogsValidation = [
  validateQueryZod(getOneCLogsQuerySchema),
];

export const putOneCCategoryMappingsValidation = [
  validateBodyZod(putOneCCategoryMappingsBodySchema),
];

export const getOneCImportJobsValidation = [
  validateQueryZod(getOneCImportJobsQuerySchema),
];
