import {
  faqItemIdParamsSchema,
  faqItemLinkPatchBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const faqItemIdParamValidation = [validateParamsZod(faqItemIdParamsSchema)];

export const patchFaqItemLinkValidation = [
  validateBodyZod(faqItemLinkPatchBodySchema),
];
