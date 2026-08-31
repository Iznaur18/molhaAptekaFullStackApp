import {
  getMyCourierProfileController,
  submitCourierApplicationController,
} from "../controllers/index.js";
import { checkAuthMW } from "../middlewares/index.js";
import { courierApplicationValidation } from "../validations/index.js";
import { createAsyncRouter } from "../utils/createAsyncRouter.js";

const router = createAsyncRouter();

// путь в createApp: /courier
router.get("/me", checkAuthMW, getMyCourierProfileController);
router.post(
  "/application",
  checkAuthMW,
  courierApplicationValidation,
  submitCourierApplicationController,
);

export { router as courierRouter };
