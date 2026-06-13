import { Router } from "express";

import { addressSuggestController } from "../controllers/Address/addressSuggestController.js";
import {
  addressSuggestRateLimiter,
  checkAuthMW,
} from "../middlewares/index.js";
import { addressSuggestValidation } from "../validations/address/addressSuggestValidation.js";

const router = Router();

router.post(
  "/suggest",
  checkAuthMW,
  addressSuggestRateLimiter,
  addressSuggestValidation,
  addressSuggestController,
);

export { router as addressRouter };
