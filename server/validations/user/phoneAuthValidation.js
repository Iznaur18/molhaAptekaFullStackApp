import {
  loginPhoneOtpConfirmBodySchema,
  loginPhoneOtpRequestBodySchema,
  loginPhonePasswordBodySchema,
  phoneBindConfirmBodySchema,
  phoneBindRequestBodySchema,
  registerPhoneBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";

export const registerPhoneUserValidation = [
  validateBodyZod(registerPhoneBodySchema),
  validateRuDeliveryAddress(),
];

export const loginPhonePasswordValidation = validateBodyZod(loginPhonePasswordBodySchema);

export const loginPhoneOtpRequestValidation = validateBodyZod(loginPhoneOtpRequestBodySchema);

export const loginPhoneOtpConfirmValidation = validateBodyZod(loginPhoneOtpConfirmBodySchema);

export const phoneBindRequestValidation = validateBodyZod(phoneBindRequestBodySchema);

export const phoneBindConfirmValidation = validateBodyZod(phoneBindConfirmBodySchema);
