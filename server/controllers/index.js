import { uploadController } from './User/uploadController.js';
import { uploadVideoController } from './User/uploadVideoController.js';
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
    markOrderItemCancelledBySellerController,
    confirmOrderItemByBuyerController,
} from './Order/updateOrderItemStatusController.js';
import { postProductController } from './Product/postProductController.js';
import { getProductsController, getMyProductsController } from './Product/getProducts.js';
import { getCatalogProductByIdController } from './Product/getCatalogProductByIdController.js';
import { deleteMyProductController } from './Product/deleteMyProductController.js';
import { patchMyProductController } from './Product/patchMyProductController.js';
import { recordProductViewController } from './Product/recordProductViewController.js';
import {
    getPendingModerationProductsController,
    getPendingModerationProductsCountController,
    approveProductModerationController,
    rejectProductModerationController,
} from './Product/productModerationControllers.js';
import {
    submitProductReportController,
    getMyProductReportStatusController,
    getPendingProductReportsController,
    getPendingProductReportsCountController,
    resolveProductReportsForProductController,
} from './Product/productReportControllers.js';
import {
    submitProductPriceOfferController,
    patchMyProductPriceOfferController,
    cancelMyProductPriceOfferController,
    getMyProductPriceOfferController,
    getTopProductPriceOffersController,
    getSellerProductPriceOffersController,
    acceptProductPriceOfferController,
    rejectProductPriceOfferController,
    getSellerProductPriceOfferArchiveController,
} from './Product/productPriceOfferControllers.js';
import {
    listProductReviewsController,
    getProductReviewSummaryController,
    submitProductReviewController,
    patchMyProductReviewController,
    deleteMyProductReviewController,
} from './Product/productReviewControllers.js';
import {
    getProductPromotionTariffsController,
    requestProductPromotionController,
    getMyProductPromotionsController,
    getPendingProductPromotionsController,
    getPendingProductPromotionsCountController,
    approveProductPromotionController,
    rejectProductPromotionController,
    cancelProductPromotionByStaffController,
    extendProductPromotionByStaffController,
} from './Product/productPromotionControllers.js';
import {
    getFeaturedRaffleController,
    getRaffleByIdController,
    getRaffleProductsController,
    createRaffleController,
    getMyRaffleController,
    patchMyRaffleController,
    patchRaffleByStaffController,
    deleteMyRaffleController,
    deleteRaffleByStaffController,
    pauseMyRaffleController,
    setProductRaffleParticipationController,
    getPendingRafflesController,
    getPendingRafflesCountController,
    approveRaffleController,
    rejectRaffleController,
} from './Raffle/raffleControllers.js';
import { markInAppNotificationsReadController } from './User/markInAppNotificationsReadController.js';
import {
    submitDataConfirmationRequestController,
    getMyDataConfirmationRequestController,
    getPendingDataConfirmationRequestsController,
    getPendingDataConfirmationRequestsCountController,
    resolveDataConfirmationRequestController,
} from './User/userDataConfirmationControllers.js';
import {
    followUserController,
    unfollowUserController,
    listMyFollowingController,
    listMyFollowersController,
} from './User/userFollowControllers.js';
import { getMyCartController } from './Cart/getMyCartController.js';
import { replaceMyCartController } from './Cart/replaceMyCartController.js';

export {
    uploadController,
    uploadVideoController,
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
    markOrderItemCancelledBySellerController,
    confirmOrderItemByBuyerController,
    postProductController,
    getProductsController,
    getMyProductsController,
    getCatalogProductByIdController,
    deleteMyProductController,
    patchMyProductController,
    recordProductViewController,
    getPendingModerationProductsController,
    getPendingModerationProductsCountController,
    approveProductModerationController,
    rejectProductModerationController,
    submitProductReportController,
    getMyProductReportStatusController,
    getPendingProductReportsController,
    getPendingProductReportsCountController,
    resolveProductReportsForProductController,
    submitProductPriceOfferController,
    patchMyProductPriceOfferController,
    cancelMyProductPriceOfferController,
    getMyProductPriceOfferController,
    getTopProductPriceOffersController,
    getSellerProductPriceOffersController,
    acceptProductPriceOfferController,
    rejectProductPriceOfferController,
    getSellerProductPriceOfferArchiveController,
    listProductReviewsController,
    getProductReviewSummaryController,
    submitProductReviewController,
    patchMyProductReviewController,
    deleteMyProductReviewController,
    getProductPromotionTariffsController,
    requestProductPromotionController,
    getMyProductPromotionsController,
    getPendingProductPromotionsController,
    getPendingProductPromotionsCountController,
    approveProductPromotionController,
    rejectProductPromotionController,
    cancelProductPromotionByStaffController,
    extendProductPromotionByStaffController,
    getFeaturedRaffleController,
    getRaffleByIdController,
    getRaffleProductsController,
    createRaffleController,
    getMyRaffleController,
    patchMyRaffleController,
    patchRaffleByStaffController,
    deleteMyRaffleController,
    deleteRaffleByStaffController,
    pauseMyRaffleController,
    setProductRaffleParticipationController,
    getPendingRafflesController,
    getPendingRafflesCountController,
    approveRaffleController,
    rejectRaffleController,
    markInAppNotificationsReadController,
    submitDataConfirmationRequestController,
    getMyDataConfirmationRequestController,
    getPendingDataConfirmationRequestsController,
    getPendingDataConfirmationRequestsCountController,
    resolveDataConfirmationRequestController,
    followUserController,
    unfollowUserController,
    listMyFollowingController,
    listMyFollowersController,
    getMyCartController,
    replaceMyCartController,
};
