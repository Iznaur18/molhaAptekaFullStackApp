import { submitProductReportBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const submitProductReportValidation = [validateBodyZod(submitProductReportBodySchema)];
