import { z } from "zod";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "./emailVerification.js";
import { mongoIdSchema } from "./mongoId.js";

/**
 * Ответ `POST /auth/register`: аккаунт ещё не создан, ожидается
 * подтверждение email кодом (`POST /auth/register/confirm`).
 */
export const pendingRegistrationDataSchema = z.object({
  pendingRegistration: z.literal(true),
  registrationId: mongoIdSchema,
  email: z.string().email(),
});

/** Body `POST /auth/register/confirm`. */
export const confirmRegistrationBodySchema = z.object({
  registrationId: mongoIdSchema,
  code: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`),
      `Код должен содержать ${EMAIL_VERIFICATION_CODE_LENGTH} цифр`,
    ),
});

/** Body `POST /auth/register/resend`. */
export const resendRegistrationCodeBodySchema = z.object({
  registrationId: mongoIdSchema,
});
