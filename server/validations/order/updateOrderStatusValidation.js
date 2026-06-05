import { body, param } from "express-validator";

import { ORDER_STATUSES } from "../../constants/orderConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Валидация `PATCH /order/:orderId/status` (только админ). */
export const updateOrderStatusValidation = [
  param("orderId").isMongoId().withMessage("orderId должен быть валидным ObjectId"),
  body("status")
    .isIn(ORDER_STATUSES)
    .withMessage(`status должен быть одним из: ${ORDER_STATUSES.join(", ")}`),
  handleValidationByExpressErrors,
];
