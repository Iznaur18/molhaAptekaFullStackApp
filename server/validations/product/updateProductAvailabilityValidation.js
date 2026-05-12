import { body } from "express-validator";

import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Тело для `PATCH /product/:productId` — только видимость / доступность для покупки. */
export const updateProductAvailabilityValidation = [
  body("productIsAvailable")
    .exists()
    .withMessage("Поле productIsAvailable обязательно")
    .isBoolean()
    .withMessage("productIsAvailable должно быть true или false"),
  handleValidationByExpressErrors,
];
