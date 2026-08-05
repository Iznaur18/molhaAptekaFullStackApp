import {
  getOneCLogsQuerySchema,
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
