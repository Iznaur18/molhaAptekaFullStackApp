import { loginUserValidation } from './user/loginUserValidation.js';
import { registerUserValidation } from './user/registerUserValidation.js';
import { telegramAuthValidation } from './user/telegramAuthValidation.js';
import { updateProfileValidation, userIdParamValidation } from './user/updateProfileValidation.js';
import { voteValidation, voteTargetIdParamValidation } from './user/voteValidation.js';
import { ratingUserIdParamValidation } from './user/ratingValidation.js';
import { userSearchValidation } from './user/userSearchValidation.js';
import { makeProductValidation } from './product/makeProductValidation.js';
import { productIdParamValidation } from './product/productIdParamValidation.js';
import { productsSearchValidation } from './product/productsSearchValidation.js';
import { updateProductAvailabilityValidation } from './product/updateProductAvailabilityValidation.js';
import { makeOrderValidation } from './order/makeOrderValidation.js';
import { updateOrderStatusValidation } from './order/updateOrderStatusValidation.js';
import { getAllOrdersValidation } from './order/getAllOrdersValidation.js';
import { getMySalesValidation } from './order/getMySalesValidation.js';
import { orderItemActionValidation } from './order/orderItemActionValidation.js';

export { 
    loginUserValidation, 
    registerUserValidation, 
    telegramAuthValidation,
    updateProfileValidation,
    userIdParamValidation,
    voteValidation,
    voteTargetIdParamValidation,
    ratingUserIdParamValidation,
    userSearchValidation,
    makeProductValidation,
    productIdParamValidation,
    productsSearchValidation,
    updateProductAvailabilityValidation,
    makeOrderValidation,
    updateOrderStatusValidation,
    getAllOrdersValidation,
    getMySalesValidation,
    orderItemActionValidation,
};