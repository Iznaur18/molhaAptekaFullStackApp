import { purchasePremiumBodySchema } from "@molha/api-contract";
import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const purchasePremiumValidation = [validateBodyZod(purchasePremiumBodySchema)];
