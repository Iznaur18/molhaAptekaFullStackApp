import { param } from "express-validator";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Валидация `productId` в URL для операций над товаром */
export const productIdParamValidation = [
  param("productId")
    .notEmpty()
    .withMessage("ID товара обязателен")
    .isMongoId()
    .withMessage("Неверный формат ID товара"),
  handleValidationByExpressErrors,
];
