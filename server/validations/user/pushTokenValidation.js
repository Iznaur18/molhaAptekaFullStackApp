import {
  registerPushTokenBodySchema,
  removePushTokenBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const registerPushTokenValidation = [
  validateBodyZod(registerPushTokenBodySchema),
];

export const removePushTokenValidation = [validateBodyZod(removePushTokenBodySchema)];
