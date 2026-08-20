import { staffBroadcastNotificationBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const staffBroadcastNotificationValidation = [
  validateBodyZod(staffBroadcastNotificationBodySchema),
];
