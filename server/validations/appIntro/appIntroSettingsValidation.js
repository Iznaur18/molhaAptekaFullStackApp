import { patchAppIntroSettingsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const patchAppIntroSettingsValidation = [
  validateBodyZod(patchAppIntroSettingsBodySchema),
];
