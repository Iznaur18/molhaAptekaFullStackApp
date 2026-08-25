import { trackAdAnalyticsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const trackAdAnalyticsValidation = [
  validateBodyZod(trackAdAnalyticsBodySchema),
];
