import { trackSellerQrScanBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const trackSellerQrScanValidation = [
  validateBodyZod(trackSellerQrScanBodySchema),
];
