import { Router } from 'express';
import {
    registerUserController,
    loginUserController,
    logoutUserController,
    userMeController,
    markInAppNotificationsReadController,
    verifyEmailController,
    resendEmailVerificationController,
} from '../controllers/index.js';
import { registerUserValidation, loginUserValidation } from '../validations/index.js';
import {
    checkAuthMW,
    authRateLimiter,
    emailVerificationResendRateLimiter,
} from '../middlewares/index.js';

const router = Router();

// путь в index.js начинается с /auth
router.get('/me', checkAuthMW, userMeController);
router.patch(
    '/me/in-app-notifications/read',
    checkAuthMW,
    markInAppNotificationsReadController,
);

// Rate limiting для авторизации (защита от брутфорса)
router.post('/register', authRateLimiter, registerUserValidation, registerUserController);
router.post('/login', authRateLimiter, loginUserValidation, loginUserController);
router.post('/logout', logoutUserController);
router.get('/verify-email', verifyEmailController);
router.post(
    '/resend-verification',
    checkAuthMW,
    emailVerificationResendRateLimiter,
    resendEmailVerificationController,
);

export { router as authRouter };
