import { patchUsersLoyaltyRaffleSettingsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const patchUsersLoyaltyRaffleSettingsValidation = [
  validateBodyZod(patchUsersLoyaltyRaffleSettingsBodySchema),
];
