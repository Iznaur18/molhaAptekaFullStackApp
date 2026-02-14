import { Router } from 'express';
import { userGetProfileController, userUpdateProfileController, userDeleteProfileController, userSearchController } from '../controllers/index.js';
import { checkAuthMW, updateProfileRateLimiter } from '../middlewares/index.js';
import { userIdParamValidation, updateProfileValidation, userSearchValidation } from '../validations/index.js';

const router = Router()

// в index.js с /user (маршрут /search должен быть выше /:userIdClient, иначе "search" попадёт в userIdClient)
router.get('/search', userSearchValidation, userSearchController); // GET /user/search - поиск пользователей
router.get('/:userIdClient', userIdParamValidation, userGetProfileController); // GET /user/:userIdClient - получение профиля пользователя (публичный) 

// Rate limiting для обновления профиля (защита от массовых изменений)
router.patch('/:userIdClient', updateProfileRateLimiter, checkAuthMW, userIdParamValidation, updateProfileValidation, userUpdateProfileController); // PATCH /user/:userIdClient - обновление профиля (требует авторизации)

router.delete('/:userIdClient', checkAuthMW, userIdParamValidation, userDeleteProfileController); // DELETE /user/:userIdClient - удаление профиля (требует авторизации)

export {router as userRouter}