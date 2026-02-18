import { uploadController } from './User/uploadController.js';
import { registerUserController } from './User/registerUserController.js';
import { loginUserController, userGetProfileController, userMeController, userUpdateProfileController, userDeleteProfileController } from './User/loginUserController.js';
import { authTelegramController } from './User/authTelegramController.js';
import { userVoteRatingController, userGetRatingController } from './User/userVoteRatingController.js';
import { userSearchController } from './User/userSearchController.js';
import { makeOrderController, getMyOrdersController, getAllOrdersController } from './Order/makeOrderController.js';
import { postProductController } from './Product/postProductController.js';

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
    userSearchController,
    makeOrderController,
    getMyOrdersController,
    getAllOrdersController,
    postProductController };
    // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);