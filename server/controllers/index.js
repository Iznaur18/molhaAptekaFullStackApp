import { uploadController } from './uploadController.js';
import { registerUserController } from './registerUserController.js';
import { loginUserController, userGetProfileController, userMeController, userUpdateProfileController, userDeleteProfileController } from './loginUserController.js';
import { authTelegramController } from './authTelegramController.js';
import { userVoteRatingController, userGetRatingController } from './userVoteRatingController.js';
import { userSearchController } from './userSearchController.js';

export {
    uploadController,
    registerUserController,
    loginUserController,
    authTelegramController,
    userVoteRatingController,
    userGetRatingController,
    userGetProfileController,
    userMeController,
    userUpdateProfileController,
    userDeleteProfileController,
    userSearchController }; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);