import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getMyFavoritesController,
  replaceMyFavoritesController,
} from "../controllers/index.js";
import { checkAuthMW, favoritesReplaceRateLimiter } from "../middlewares/index.js";
import { replaceMyFavoritesValidation } from "../validations/index.js";

const router = createAsyncRouter();

router.get("/", checkAuthMW, getMyFavoritesController);
router.put(
  "/",
  checkAuthMW,
  favoritesReplaceRateLimiter,
  replaceMyFavoritesValidation,
  replaceMyFavoritesController,
);

export { router as favoritesRouter };
