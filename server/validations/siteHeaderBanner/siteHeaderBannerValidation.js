import { patchSiteHeaderBannerSettingsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const patchSiteHeaderBannerSettingsValidation = [
  validateBodyZod(patchSiteHeaderBannerSettingsBodySchema),
];
