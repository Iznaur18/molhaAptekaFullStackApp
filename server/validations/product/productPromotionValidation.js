import { body, query } from "express-validator";
import {
  PRODUCT_PROMOTION_DURATION_OPTIONS,
  PRODUCT_PROMOTION_STATUSES,
  PRODUCT_PROMOTION_TIERS,
} from "../../constants/productPromotionConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

const DURATION_CODES = PRODUCT_PROMOTION_DURATION_OPTIONS.map((item) => item.code);

export const requestProductPromotionValidation = [
  body("tier")
    .isInt({ min: 1, max: 3 })
    .withMessage("tier обязателен")
    .custom((value) => PRODUCT_PROMOTION_TIERS.includes(Number(value)))
    .withMessage("Неверный уровень продвижения"),
  body("tariffCode")
    .isString()
    .withMessage("tariffCode обязателен")
    .trim()
    .notEmpty()
    .withMessage("tariffCode обязателен")
    .custom((value) => DURATION_CODES.includes(String(value)))
    .withMessage("Неверный срок продвижения"),
  handleValidationByExpressErrors,
];

export const myProductPromotionsValidation = [
  query("status")
    .optional()
    .isString()
    .withMessage("status должен быть строкой")
    .custom((value) => PRODUCT_PROMOTION_STATUSES.includes(String(value)))
    .withMessage(`status должен быть одним из: ${PRODUCT_PROMOTION_STATUSES.join(", ")}`),
  handleValidationByExpressErrors,
];
