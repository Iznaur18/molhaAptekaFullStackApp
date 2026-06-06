import { body } from "express-validator";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "../../constants/emailVerificationConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const verifyEmailWithCodeValidation = [
  body("code")
    .trim()
    .matches(new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`))
    .withMessage(`Код должен содержать ${EMAIL_VERIFICATION_CODE_LENGTH} цифр`),

  handleValidationByExpressErrors,
];
