/** Срок действия токена подтверждения email (24 ч). */
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Лимит повторной отправки письма с одного аккаунта в час. */
export const EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR = 5;

export const EMAIL_NOT_VERIFIED_MESSAGE =
  "Подтвердите email перед оформлением заказа или рассрочки";

export const EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE = "Email уже подтверждён";

export const EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE =
  "Ссылка подтверждения недействительна или устарела";

export const EMAIL_VERIFICATION_SENT_MESSAGE = "Письмо с подтверждением отправлено";

export const EMAIL_VERIFICATION_SUCCESS_MESSAGE = "Email успешно подтверждён";
