import { body, param } from 'express-validator';

import {
    INSTALLMENT_MONTHS_MAX,
    INSTALLMENT_MONTHS_MIN,
    INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
    INSTALLMENT_PLANS_MAX,
    INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
} from '../../constants/installmentConstants.js';
import { ORDER_LINE_ITEM_QUANTITY_MIN, ORDER_PAYMENT_METHODS } from '../../constants/orderConstants.js';
import { ruDeliveryAddressBodyValidation } from '../address/ruDeliveryAddressValidation.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const upsertProductInstallmentProgramValidation = [
    body('isEnabled')
        .isBoolean()
        .withMessage('isEnabled должен быть boolean'),
    body('plans')
        .isArray({ min: 1, max: INSTALLMENT_PLANS_MAX })
        .withMessage(`plans: от 1 до ${INSTALLMENT_PLANS_MAX} элементов`),
    body('plans.*.title')
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: INSTALLMENT_PLAN_TITLE_MAX_LENGTH }),
    body('plans.*.monthsCount')
        .isInt({ min: INSTALLMENT_MONTHS_MIN, max: INSTALLMENT_MONTHS_MAX })
        .toInt(),
    body('plans.*.monthlyAmountRub')
        .isInt({ min: INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB })
        .toInt(),
    body('plans.*.firstPaymentRequiredNow')
        .optional()
        .isBoolean(),
    handleValidationByExpressErrors,
];

export const rejectInstallmentModerationValidation = [
    body('moderationComment')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 }),
    handleValidationByExpressErrors,
];

export const createInstallmentContractValidation = [
    body('planId').isMongoId().withMessage('planId должен быть ObjectId'),
    body('quantity')
        .isInt({ min: ORDER_LINE_ITEM_QUANTITY_MIN })
        .withMessage(`quantity >= ${ORDER_LINE_ITEM_QUANTITY_MIN}`)
        .toInt(),
    ...ruDeliveryAddressBodyValidation({
        lineField: 'deliveryAddress',
        flatField: 'deliveryAddressFlat',
        lineRequired: true,
    }),
    body('paymentMethod')
        .isIn(ORDER_PAYMENT_METHODS)
        .withMessage(`paymentMethod: ${ORDER_PAYMENT_METHODS.join(', ')}`),
    handleValidationByExpressErrors,
];

export const installmentContractIdParamValidation = [
    param('contractId').isMongoId(),
    handleValidationByExpressErrors,
];

export const installmentPaymentIndexParamValidation = [
    param('contractId').isMongoId(),
    param('paymentIndex').isInt({ min: 1 }).toInt(),
    handleValidationByExpressErrors,
];

export const installmentSellerMessageValidation = [
    body('message')
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: 2000 }),
    handleValidationByExpressErrors,
];

export const installmentDisputeValidation = [
    body('reason')
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: 2000 }),
    handleValidationByExpressErrors,
];

export const resolveInstallmentDisputeValidation = [
    body('resolutionNote')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 }),
    body('action')
        .isIn(['close', 'cancel', 'adjust_schedule', 'partial_refund'])
        .withMessage('action: close | cancel | adjust_schedule | partial_refund'),
    body('partialRefundRub')
        .optional()
        .isInt({ min: 1 })
        .toInt(),
    handleValidationByExpressErrors,
];

export const installmentDisputeIdParamValidation = [
    param('disputeId').isMongoId(),
    handleValidationByExpressErrors,
];

export const installmentCancelValidation = [
    body('reason')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 }),
    handleValidationByExpressErrors,
];
