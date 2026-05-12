import { uploadController } from './User/uploadController.js';
import { registerUserController } from './User/registerUserController.js';
import { loginUserController, userGetProfileController, userMeController, userUpdateProfileController, userDeleteProfileController } from './User/loginUserController.js';
import { authTelegramController } from './User/authTelegramController.js';
import { userVoteRatingController, userGetRatingController, getMyVoteForTargetController } from './User/userVoteRatingController.js';
import { userSearchController } from './User/userSearchController.js';
import { makeOrderController } from './Order/makeOrderController.js';
import { getMyOrdersController } from './Order/getMyOrdersController.js';
import { getMySalesController } from './Order/getMySalesController.js';
import { getAllOrdersController } from './Order/getAllOrdersController.js';
import { updateOrderStatusController } from './Order/updateOrderStatusController.js';
import {
    markOrderItemShippedBySellerController,
    markOrderItemDeliveredBySellerController,
    confirmOrderItemByBuyerController,
} from './Order/updateOrderItemStatusController.js';
import { postProductController } from './Product/postProductController.js';
import { getProductsController, getMyProductsController } from './Product/getProducts.js';
import { deleteMyProductController } from './Product/deleteMyProductController.js';
import { patchMyProductAvailabilityController } from './Product/patchMyProductAvailabilityController.js';

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
    getMySalesController,
    getAllOrdersController,
    updateOrderStatusController,
    markOrderItemShippedBySellerController,
    markOrderItemDeliveredBySellerController,
    confirmOrderItemByBuyerController,
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController,
    patchMyProductAvailabilityController,
};
    // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);