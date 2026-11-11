import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW, optionalAuthMW } from "../middlewares/index.js";
import {
  getMyLuckyBoxConfigController,
  getSellerLuckyBoxStateController,
  listMyLuckyBoxWinsController,
  playSellerLuckyBoxController,
  putMyLuckyBoxConfigController,
} from "../controllers/SellerLuckyBox/sellerLuckyBoxControllers.js";
import {
  luckyBoxSellerIdParamValidation,
  playLuckyBoxValidation,
  putLuckyBoxConfigValidation,
} from "../validations/sellerLuckyBox/sellerLuckyBoxValidation.js";

const router = createAsyncRouter();

router.get(
  "/seller/:sellerId",
  optionalAuthMW,
  luckyBoxSellerIdParamValidation,
  getSellerLuckyBoxStateController,
);
router.post(
  "/seller/:sellerId/play",
  checkAuthMW,
  playLuckyBoxValidation,
  playSellerLuckyBoxController,
);
router.get("/me/config", checkAuthMW, getMyLuckyBoxConfigController);
router.put(
  "/me/config",
  checkAuthMW,
  putLuckyBoxConfigValidation,
  putMyLuckyBoxConfigController,
);
router.get("/me/wins", checkAuthMW, listMyLuckyBoxWinsController);

export default router;
