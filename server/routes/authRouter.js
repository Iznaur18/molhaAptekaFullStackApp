import { Router } from 'express';
import { registerUserController, loginUserController, authTelegramController } from '../controllers/index.js';
import { registerUserValidation, loginUserValidation, telegramAuthValidation } from '../validations/index.js';

const router = Router();

router.post('/register', registerUserValidation, registerUserController); // в Insomnia URL: http://localhost:4444/auth/register
router.post('/login', loginUserValidation, loginUserController);
router.post('/telegram', telegramAuthValidation, authTelegramController);

export { router as authRouter };
