import { param } from "express-validator";

import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const productCategoryIdParamValidation = [
  param("categoryId")
    .isMongoId()
    .withMessage("categoryId должен быть валидным ObjectId"),
  handleValidationByExpressErrors,
];
