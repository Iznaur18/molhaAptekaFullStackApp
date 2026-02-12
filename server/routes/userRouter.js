import { Router } from 'express';
import { userGetProfileController, userUpdateProfileController, userDeleteProfileController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/checkAuthMW.js';

const router = Router()

// в index.js с /user
router.get('/:userIdClient', userGetProfileController); // GET /user/:userIdClient - получение профиля пользователя (публичный)
router.patch('/:userIdClient', checkAuthMW, userUpdateProfileController); // PATCH /user/:userIdClient - обновление профиля (требует авторизации)
router.delete('/:userIdClient', checkAuthMW, userDeleteProfileController); // DELETE /user/:userIdClient - удаление профиля (требует авторизации)

export {router as userRouter}