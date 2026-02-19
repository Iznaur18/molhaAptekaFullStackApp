import { loginUserValidation } from './user/loginUserValidation.js';
import { registerUserValidation } from './user/registerUserValidation.js';
import { telegramAuthValidation } from './user/telegramAuthValidation.js';
import { updateProfileValidation, userIdParamValidation } from './user/updateProfileValidation.js';
import { voteValidation, voteTargetIdParamValidation } from './user/voteValidation.js';
import { ratingUserIdParamValidation } from './user/ratingValidation.js';
import { userSearchValidation } from './user/userSearchValidation.js';
import { makeProductValidation } from './product/makeProductValidation.js';

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
    makeProductValidation
};