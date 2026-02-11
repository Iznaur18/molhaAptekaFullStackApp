import { Router } from 'express';
import { registerUserController, loginUserController, authTelegramController, userMeController } from '../controllers/index.js';
import { registerUserValidation, loginUserValidation, telegramAuthValidation } from '../validations/index.js';
import { checkAuthMW } from '../middlewares/checkAuthMW.js';

const router = Router();

// путь в index.js начинается с /auth
router.post('/register', registerUserValidation, registerUserController);
router.post('/login', loginUserValidation, loginUserController);
router.post('/telegram', telegramAuthValidation, authTelegramController);
router.get('/me', checkAuthMW, userMeController);

export { router as authRouter };
