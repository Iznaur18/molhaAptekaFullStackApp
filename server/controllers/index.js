import { uploadController } from './User/uploadController.js';
import { registerUserController } from './User/registerUserController.js';
import { loginUserController, userGetProfileController, userMeController, userUpdateProfileController, userDeleteProfileController } from './User/loginUserController.js';
import { authTelegramController } from './User/authTelegramController.js';
import { userVoteRatingController, userGetRatingController, getMyVoteForTargetController } from './User/userVoteRatingController.js';
import { userSearchController } from './User/userSearchController.js';
import { getUserPurchasesController } from './User/getUserPurchasesController.js';
import { getUserProductsController } from './User/getUserProductsController.js';
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
import { patchMyProductController } from './Product/patchMyProductController.js';
import { recordProductViewController } from './Product/recordProductViewController.js';
import {
    getPendingModerationProductsController,
    approveProductModerationController,
    rejectProductModerationController,
} from './Product/productModerationControllers.js';
import { getMyCartController } from './Cart/getMyCartController.js';
import { replaceMyCartController } from './Cart/replaceMyCartController.js';

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
    getUserPurchasesController,
    getUserProductsController,
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
    patchMyProductController,
    recordProductViewController,
    getPendingModerationProductsController,
    approveProductModerationController,
    rejectProductModerationController,
    getMyCartController,
    replaceMyCartController,
};
