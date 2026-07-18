import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  uploadMW,
  checkAuthMW,
  checkProductModeratorMW,
  uploadRateLimiter,
  uploadVideoMW,
} from "../middlewares/index.js";
import {
  uploadController,
  uploadVideoController,
  getPrivateUploadController,
} from "../controllers/index.js";

const router = createAsyncRouter();

router.get(
  "/private/:filename",
  checkAuthMW,
  checkProductModeratorMW,
  getPrivateUploadController,
);

router.post(
  "/",
  checkAuthMW,
  uploadRateLimiter,
  uploadMW.single("image"),
  uploadController,
);

router.post(
  "/video",
  checkAuthMW,
  uploadRateLimiter,
  uploadVideoMW.single("video"),
  uploadVideoController,
);

export { router as uploadRouter };
