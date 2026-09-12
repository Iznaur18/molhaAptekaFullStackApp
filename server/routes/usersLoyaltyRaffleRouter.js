import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getUsersLoyaltyRaffleSettingsController,
  patchUsersLoyaltyRaffleSettingsController,
  resetUsersLoyaltyRaffleProgressController,
} from "../controllers/UsersLoyaltyRaffle/usersLoyaltyRaffleSettingsControllers.js";
import { checkAdminMW, checkAuthMW } from "../middlewares/index.js";
import { patchUsersLoyaltyRaffleSettingsValidation } from "../validations/usersLoyaltyRaffle/usersLoyaltyRaffleSettingsValidation.js";

const router = createAsyncRouter();

router.get("/", getUsersLoyaltyRaffleSettingsController);
router.patch(
  "/",
  checkAuthMW,
  checkAdminMW,
  patchUsersLoyaltyRaffleSettingsValidation,
  patchUsersLoyaltyRaffleSettingsController,
);
router.post(
  "/reset-progress",
  checkAuthMW,
  checkAdminMW,
  resetUsersLoyaltyRaffleProgressController,
);

export { router as usersLoyaltyRaffleRouter };
