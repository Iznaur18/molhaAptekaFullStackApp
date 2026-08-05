import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import { addressGeolocateController } from "../controllers/Address/addressGeolocateController.js";
import { addressSuggestController } from "../controllers/Address/addressSuggestController.js";
import { addressSuggestRateLimiter, checkAuthMW } from "../middlewares/index.js";
import { addressGeolocateValidation } from "../validations/address/addressGeolocateValidation.js";
import { addressSuggestValidation } from "../validations/address/addressSuggestValidation.js";

const router = createAsyncRouter();

router.post(
  "/suggest",
  checkAuthMW,
  addressSuggestRateLimiter,
  addressSuggestValidation,
  addressSuggestController,
);

router.post(
  "/geolocate",
  checkAuthMW,
  addressSuggestRateLimiter,
  addressGeolocateValidation,
  addressGeolocateController,
);

export { router as addressRouter };
