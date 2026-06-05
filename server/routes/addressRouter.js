import { Router } from "express";

import { addressSuggestController } from "../controllers/Address/addressSuggestController.js";
import { generalRateLimiter } from "../middlewares/index.js";
import { addressSuggestValidation } from "../validations/address/addressSuggestValidation.js";

const router = Router();

router.post(
  "/suggest",
  generalRateLimiter,
  addressSuggestValidation,
  addressSuggestController,
);

export { router as addressRouter };
