import { Router } from "express";

import {
  getMyFavoritesController,
  replaceMyFavoritesController,
} from "../controllers/index.js";
import { checkAuthMW, favoritesReplaceRateLimiter } from "../middlewares/index.js";
import { replaceMyFavoritesValidation } from "../validations/index.js";

const router = Router();

router.get("/", checkAuthMW, getMyFavoritesController);
router.put(
  "/",
  checkAuthMW,
  favoritesReplaceRateLimiter,
  replaceMyFavoritesValidation,
  replaceMyFavoritesController,
);

export { router as favoritesRouter };
