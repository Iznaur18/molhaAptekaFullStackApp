import { uploadController } from './User/uploadController.js';
import { registerUserController } from './User/registerUserController.js';
import { loginUserController, userGetProfileController, userMeController, userUpdateProfileController, userDeleteProfileController } from './User/loginUserController.js';
import { authTelegramController } from './User/authTelegramController.js';
import { userVoteRatingController, userGetRatingController, getMyVoteForTargetController } from './User/userVoteRatingController.js';
import { userSearchController } from './User/userSearchController.js';
import { makeOrderController, getMyOrdersController, getAllOrdersController } from './Order/makeOrderController.js';
import { postProductController } from './Product/postProductController.js';
import { getProductsController, getMyProductsController } from './Product/getProducts.js';
import { deleteMyProductController } from './Product/deleteMyProductController.js';

export {
    uploadController,
    registerUserController,
    loginUserController,
    authTelegramController,
    userVoteRatingController,
    userGetRatingController,
    getMyVoteForTargetController,
    userGetProfileController,
    userMeController,
    userUpdateProfileController,
    userDeleteProfileController,
    userSearchController,
    makeOrderController,
    getMyOrdersController,
    getAllOrdersController,
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController
};
    // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);