import {
  getMySellerSafeDealController,
  submitSellerSafeDealApplicationController,
} from "../controllers/index.js";
import { checkAuthMW } from "../middlewares/index.js";
import { safeDealApplicationValidation } from "../validations/index.js";
import { createAsyncRouter } from "../utils/createAsyncRouter.js";

const router = createAsyncRouter();

// путь в createApp: /sellers
// Множественное число намеренно, как у /couriers: SPA-роут /profile/safe-deal
// не должен попадать в API по префиксу.
router.get("/safe-deal/me", checkAuthMW, getMySellerSafeDealController);
router.post(
  "/safe-deal/application",
  checkAuthMW,
  safeDealApplicationValidation,
  submitSellerSafeDealApplicationController,
);

export { router as sellerRouter };
