import { Router } from 'express';
import { registerUserController, loginUserController, authTelegramController } from '../controllers/index.js';

const router = Router();

router.post('/register', registerUserController);
router.post('/login', loginUserController);
router.post('/telegram', authTelegramController);

export { router as authRouter };
