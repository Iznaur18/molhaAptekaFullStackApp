import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  registerUserController,
  confirmRegistrationController,
  resendRegistrationCodeController,
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
  registerPhoneUserController,
  loginPhonePasswordController,
  loginPhoneOtpRequestController,
  loginPhoneOtpConfirmController,
  phoneBindRequestController,
  phoneBindConfirmController,
  emailBindRequestController,
  emailBindConfirmController,
  passwordResetRequestController,
  passwordResetConfirmController,
  passwordChangeController,
} from "../controllers/index.js";
import { registerUserValidation, loginUserValidation } from "../validations/index.js";
import {
  registerPhoneUserValidation,
  loginPhonePasswordValidation,
  loginPhoneOtpRequestValidation,
  loginPhoneOtpConfirmValidation,
  phoneBindRequestValidation,
  phoneBindConfirmValidation,
  emailBindRequestValidation,
  emailBindConfirmValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation,
  passwordChangeValidation,
} from "../validations/user/phoneAuthValidation.js";
import { verifyEmailWithCodeValidation } from "../validations/user/verifyEmailWithCodeValidation.js";
import {
  confirmRegistrationValidation,
  resendRegistrationCodeValidation,
} from "../validations/user/confirmRegistrationValidation.js";
import { refreshAuthValidation } from "../validations/user/refreshAuthValidation.js";
import { verifyEmailTokenValidation } from "../validations/user/verifyEmailTokenValidation.js";
import {
  registerPushTokenValidation,
  removePushTokenValidation,
} from "../validations/user/pushTokenValidation.js";
import { emptyBodyValidation } from "../validations/common/emptyBodyValidation.js";
import {
  checkAuthMW,
  checkAuthMeMW,
  authRateLimiter,
  registerAuthRateLimiter,
  refreshAuthRateLimiter,
  emailVerificationResendRateLimiter,
} from "../middlewares/index.js";

const router = createAsyncRouter();

// путь в index.js начинается с /auth
router.get("/me", checkAuthMeMW, userMeController);
router.patch(
  "/me/in-app-notifications/read",
  checkAuthMW,
  emptyBodyValidation,
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

// Rate limiting для авторизации (защита от брутфорса / email bombing)
router.post(
  "/register",
  registerAuthRateLimiter,
  registerUserValidation,
  registerUserController,
);
router.post(
  "/register/phone",
  registerAuthRateLimiter,
  registerPhoneUserValidation,
  registerPhoneUserController,
);
router.post(
  "/register/confirm",
  registerAuthRateLimiter,
  confirmRegistrationValidation,
  confirmRegistrationController,
);
router.post(
  "/register/resend",
  emailVerificationResendRateLimiter,
  resendRegistrationCodeValidation,
  resendRegistrationCodeController,
);
router.post("/login", authRateLimiter, loginUserValidation, loginUserController);
router.post(
  "/login/phone",
  authRateLimiter,
  loginPhonePasswordValidation,
  loginPhonePasswordController,
);
router.post(
  "/login/phone/otp/request",
  emailVerificationResendRateLimiter,
  loginPhoneOtpRequestValidation,
  loginPhoneOtpRequestController,
);
router.post(
  "/login/phone/otp/confirm",
  authRateLimiter,
  loginPhoneOtpConfirmValidation,
  loginPhoneOtpConfirmController,
);
router.post(
  "/phone/bind/request",
  checkAuthMW,
  emailVerificationResendRateLimiter,
  phoneBindRequestValidation,
  phoneBindRequestController,
);
router.post(
  "/phone/bind/confirm",
  checkAuthMW,
  authRateLimiter,
  phoneBindConfirmValidation,
  phoneBindConfirmController,
);
router.post(
  "/email/bind/request",
  checkAuthMW,
  emailVerificationResendRateLimiter,
  emailBindRequestValidation,
  emailBindRequestController,
);
router.post(
  "/email/bind/confirm",
  checkAuthMW,
  authRateLimiter,
  emailBindConfirmValidation,
  emailBindConfirmController,
);
router.post(
  "/password/reset/request",
  emailVerificationResendRateLimiter,
  passwordResetRequestValidation,
  passwordResetRequestController,
);
router.post(
  "/password/reset/confirm",
  authRateLimiter,
  passwordResetConfirmValidation,
  passwordResetConfirmController,
);
router.post(
  "/password/change",
  checkAuthMW,
  authRateLimiter,
  passwordChangeValidation,
  passwordChangeController,
);
router.post("/logout", logoutUserController);
router.post(
  "/refresh",
  refreshAuthRateLimiter,
  refreshAuthValidation,
  refreshAuthController,
);
router.get("/verify-email", verifyEmailTokenValidation, verifyEmailController);
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
  emptyBodyValidation,
  resendEmailVerificationController,
);

export { router as authRouter };
