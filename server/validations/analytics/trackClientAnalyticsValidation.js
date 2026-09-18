import { trackClientAnalyticsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const trackClientAnalyticsValidation = [
  validateBodyZod(trackClientAnalyticsBodySchema),
];
