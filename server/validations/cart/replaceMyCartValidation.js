import { body } from "express-validator";

import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Валидация тела `PUT /cart` — полная замена; детали — в контроллере. */
export const replaceMyCartValidation = [
  body("items")
    .exists()
    .withMessage("items обязателен")
    .isObject()
    .withMessage("items должен быть объектом"),
  handleValidationByExpressErrors,
];
