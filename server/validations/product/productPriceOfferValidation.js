import { body, param } from "express-validator";

import { PRODUCT_PRICE_RUB_MAX } from "../../constants/productConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const productPriceOfferIdParamValidation = [
  param("offerId").isMongoId().withMessage("Некорректный id предложения"),
  handleValidationByExpressErrors,
];

export const submitProductPriceOfferValidation = [
  body("offerPrice")
    .isInt({ min: 1, max: PRODUCT_PRICE_RUB_MAX })
    .withMessage(`offerPrice — целое число от 1 до ${PRODUCT_PRICE_RUB_MAX}`)
    .toInt(),
  handleValidationByExpressErrors,
];

export const patchProductPriceOfferValidation = [
  body("offerPrice")
    .isInt({ min: 1, max: PRODUCT_PRICE_RUB_MAX })
    .withMessage(`offerPrice — целое число от 1 до ${PRODUCT_PRICE_RUB_MAX}`)
    .toInt(),
  handleValidationByExpressErrors,
];
