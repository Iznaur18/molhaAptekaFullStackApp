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

/** Синхрон с `server/utils/emailVerification.js` — `randomBytes(32).toString("hex")`. */
export const EMAIL_VERIFICATION_TOKEN_HEX_LENGTH = 64;

/** Query `GET /auth/verify-email?token=...`. */
export const verifyEmailTokenQuerySchema = z.object({
  token: z
    .string()
    .trim()
    .regex(
      new RegExp(`^[a-f0-9]{${EMAIL_VERIFICATION_TOKEN_HEX_LENGTH}}$`, "i"),
      "Неверный токен подтверждения email",
    ),
});
