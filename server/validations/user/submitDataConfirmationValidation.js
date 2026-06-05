import { body } from "express-validator";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const submitDataConfirmationValidation = [
  body("passport.lastName").optional().isString().trim(),
  body("passport.firstName").optional().isString().trim(),
  body("passport.middleName").optional().isString().trim(),
  body("passport.series").optional().isString().trim(),
  body("passport.number").optional().isString().trim(),
  body("passport.issuedBy").optional().isString().trim(),
  body("passport.departmentCode").optional().isString().trim(),
  body("passport.birthDate").optional(),
  body("passport.issuedAt").optional(),
  body("passportSelfiePhotoUrl").optional().isString().trim(),
  body("lastName").optional().isString().trim(),
  body("firstName").optional().isString().trim(),
  handleValidationByExpressErrors,
];
