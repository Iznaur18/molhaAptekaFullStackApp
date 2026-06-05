import { body } from "express-validator";

import { PRODUCT_MODERATION_COMMENT_MAX_LENGTH } from "../../constants/productModerationConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const rejectProductModerationValidation = [
  body("productModerationComment")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("productModerationComment должен быть строкой")
    .isLength({ max: PRODUCT_MODERATION_COMMENT_MAX_LENGTH })
    .withMessage(
      `Комментарий не длиннее ${PRODUCT_MODERATION_COMMENT_MAX_LENGTH} символов`,
    ),
  handleValidationByExpressErrors,
];
