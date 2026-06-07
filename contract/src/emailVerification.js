import { z } from "zod";

/** Синхрон с `server/constants/emailVerificationConstants.js`. */
export const EMAIL_VERIFICATION_CODE_LENGTH = 6;

export const verifyEmailWithCodeBodySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`),
      `Код должен содержать ${EMAIL_VERIFICATION_CODE_LENGTH} цифр`,
    ),
});
