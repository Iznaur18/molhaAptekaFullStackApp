import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import { addressSuggestController } from "../controllers/Address/addressSuggestController.js";
import {
  addressSuggestRateLimiter,
  checkAuthMW,
} from "../middlewares/index.js";
import { addressSuggestValidation } from "../validations/address/addressSuggestValidation.js";

const router = createAsyncRouter();

router.post(
  "/suggest",
  checkAuthMW,
  addressSuggestRateLimiter,
  addressSuggestValidation,
  addressSuggestController,
);

export { router as addressRouter };
