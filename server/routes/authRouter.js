import { Router } from "express";
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshAuthController,
  userMeController,
  markInAppNotificationsReadController,
  registerPushTokenController,
  removePushTokenController,
  verifyEmailController,
  resendEmailVerificationController,
  verifyEmailWithCodeController,
} from "../controllers/index.js";
import { registerUserValidation, loginUserValidation } from "../validations/index.js";
import { verifyEmailWithCodeValidation } from "../validations/user/verifyEmailWithCodeValidation.js";
import {
  registerPushTokenValidation,
  removePushTokenValidation,
} from "../validations/user/pushTokenValidation.js";
import {
  checkAuthMW,
  checkAuthMeMW,
  authRateLimiter,
  refreshAuthRateLimiter,
  emailVerificationResendRateLimiter,
} from "../middlewares/index.js";

const router = Router();

// путь в index.js начинается с /auth
router.get("/me", checkAuthMeMW, userMeController);
router.patch(
  "/me/in-app-notifications/read",
  checkAuthMW,
  markInAppNotificationsReadController,
);
router.put(
  "/me/push-token",
  checkAuthMW,
  registerPushTokenValidation,
  registerPushTokenController,
);
router.delete(
  "/me/push-token",
  checkAuthMW,
  removePushTokenValidation,
  removePushTokenController,
);

// Rate limiting для авторизации (защита от брутфорса)
router.post(
  "/register",
  authRateLimiter,
  registerUserValidation,
  registerUserController,
);
router.post("/login", authRateLimiter, loginUserValidation, loginUserController);
router.post("/logout", logoutUserController);
router.post("/refresh", refreshAuthRateLimiter, refreshAuthController);
router.get("/verify-email", verifyEmailController);
router.post(
  "/verify-email",
  checkAuthMW,
  verifyEmailWithCodeValidation,
  verifyEmailWithCodeController,
);
router.post(
  "/resend-verification",
  checkAuthMW,
  emailVerificationResendRateLimiter,
  resendEmailVerificationController,
);

export { router as authRouter };
