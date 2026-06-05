import { body, param } from "express-validator";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";
import { USER_DATA_CONFIRMATION_RESOLUTIONS } from "../../constants/userDataConfirmationConstants.js";

export const resolveDataConfirmationValidation = [
  param("requestId").isMongoId().withMessage("Некорректный id заявки"),
  body("resolution")
    .isString()
    .trim()
    .isIn(USER_DATA_CONFIRMATION_RESOLUTIONS)
    .withMessage("resolution должен быть approve или reject"),
  body("staffNote").optional().isString().trim().isLength({ max: 2000 }),
  handleValidationByExpressErrors,
];
