import {
  registerWebPushSubscriptionBodySchema,
  removeWebPushSubscriptionBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const registerWebPushSubscriptionValidation = [
  validateBodyZod(registerWebPushSubscriptionBodySchema),
];

export const removeWebPushSubscriptionValidation = [
  validateBodyZod(removeWebPushSubscriptionBodySchema),
];
