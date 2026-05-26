import { query } from 'express-validator';

import { USER_FOLLOW_MAX_LIST_LIMIT } from '../../constants/userFollowConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const userFollowListValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page должен быть целым числом от 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: USER_FOLLOW_MAX_LIST_LIMIT })
        .withMessage(
            `limit должен быть от 1 до ${USER_FOLLOW_MAX_LIST_LIMIT}`,
        )
        .toInt(),
    handleValidationByExpressErrors,
];
