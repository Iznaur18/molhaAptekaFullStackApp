import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getUsersLoyaltyRaffleSettingsController,
  patchUsersLoyaltyRaffleSettingsController,
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

export { router as usersLoyaltyRaffleRouter };
