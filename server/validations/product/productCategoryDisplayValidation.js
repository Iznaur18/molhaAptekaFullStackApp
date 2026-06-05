import { body, param } from "express-validator";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const productCategorySlugParamValidation = [
  param("categorySlug")
    .isString()
    .withMessage("categorySlug обязателен")
    .trim()
    .notEmpty()
    .withMessage("categorySlug обязателен")
    .custom((value) => PRODUCT_CATEGORY_VALUES.includes(String(value)))
    .withMessage("Неизвестная категория"),
  handleValidationByExpressErrors,
];

export const patchProductCategoryDisplayValidation = [
  body("customLabel")
    .optional({ nullable: true })
    .isString()
    .withMessage("customLabel должен быть строкой")
    .isLength({ max: 120 })
    .withMessage("customLabel слишком длинный"),
  body("imageUrl")
    .optional({ nullable: true })
    .isString()
    .withMessage("imageUrl должен быть строкой")
    .isLength({ max: 2048 })
    .withMessage("imageUrl слишком длинный"),
  body("resetCustomLabel")
    .optional()
    .isBoolean()
    .withMessage("resetCustomLabel должен быть boolean"),
  body("resetImageUrl")
    .optional()
    .isBoolean()
    .withMessage("resetImageUrl должен быть boolean"),
  handleValidationByExpressErrors,
];
