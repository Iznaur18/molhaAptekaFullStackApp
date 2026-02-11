import { uploadController } from './uploadController.js';
import { registerUserController } from './registerUserController.js';
import { loginUserController, userGetProfileController, userMeController } from './loginUserController.js';
import { authTelegramController } from './authTelegramController.js';
import { userVoteRatingController, userGetRatingController } from './userVoteRatingController.js';

export { uploadController,
    registerUserController,
    loginUserController,
    authTelegramController,
    userVoteRatingController,
    userGetRatingController,
    userGetProfileController,
    userMeController }; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);