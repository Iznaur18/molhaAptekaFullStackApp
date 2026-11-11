import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW, optionalAuthMW } from "../middlewares/index.js";
import {
  getMyFortuneWheelConfigController,
  getSellerFortuneWheelStateController,
  listMyFortuneWheelWinsController,
  putMyFortuneWheelConfigController,
  spinSellerFortuneWheelController,
} from "../controllers/SellerFortuneWheel/sellerFortuneWheelControllers.js";
import {
  fortuneWheelSellerIdParamValidation,
  putFortuneWheelConfigValidation,
} from "../validations/sellerFortuneWheel/sellerFortuneWheelValidation.js";

const router = createAsyncRouter();

router.get(
  "/seller/:sellerId",
  optionalAuthMW,
  fortuneWheelSellerIdParamValidation,
  getSellerFortuneWheelStateController,
);
router.post(
  "/seller/:sellerId/spin",
  checkAuthMW,
  fortuneWheelSellerIdParamValidation,
  spinSellerFortuneWheelController,
);
router.get("/me/config", checkAuthMW, getMyFortuneWheelConfigController);
router.put(
  "/me/config",
  checkAuthMW,
  putFortuneWheelConfigValidation,
  putMyFortuneWheelConfigController,
);
router.get("/me/wins", checkAuthMW, listMyFortuneWheelWinsController);

export default router;
