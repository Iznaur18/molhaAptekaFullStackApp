import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import { getMyCartController, replaceMyCartController } from "../controllers/index.js";
import { cartReplaceRateLimiter, checkAuthMW } from "../middlewares/index.js";
import { replaceMyCartValidation } from "../validations/index.js";

const router = createAsyncRouter();

router.get("/", checkAuthMW, getMyCartController);
router.put(
  "/",
  checkAuthMW,
  cartReplaceRateLimiter,
  replaceMyCartValidation,
  replaceMyCartController,
);

export { router as cartRouter };
