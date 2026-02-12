import { Router } from 'express';
import { registerUserController, loginUserController, authTelegramController, userMeController } from '../controllers/index.js';
import { registerUserValidation, loginUserValidation, telegramAuthValidation } from '../validations/index.js';
import { checkAuthMW, authRateLimiter } from '../middlewares/index.js';

const router = Router();

// путь в index.js начинается с /auth
router.get('/me', checkAuthMW, userMeController);

// Rate limiting для авторизации (защита от брутфорса)
router.post('/register', authRateLimiter, registerUserValidation, registerUserController);
router.post('/login', authRateLimiter, loginUserValidation, loginUserController);
router.post('/telegram', authRateLimiter, telegramAuthValidation, authTelegramController);

export { router as authRouter };
