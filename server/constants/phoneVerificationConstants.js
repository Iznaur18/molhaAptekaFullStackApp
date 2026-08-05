/** Срок действия SMS-кода (10 мин). */
export const PHONE_VERIFICATION_TOKEN_TTL_MS = 10 * 60 * 1000;

/** Длина цифрового SMS-кода (как email OTP). */
export const PHONE_VERIFICATION_CODE_LENGTH = 6;

/** Максимум неверных попыток ввода кода до повторной отправки. */
export const PHONE_VERIFICATION_MAX_ATTEMPTS = 10;

/** Лимит повторной отправки SMS с одного аккаунта/номера в час. */
export const PHONE_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR = 5;

export const PHONE_VERIFICATION_ALREADY_VERIFIED_MESSAGE = "Телефон уже подтверждён";

export const PHONE_VERIFICATION_INVALID_CODE_MESSAGE =
  "Неверный или устаревший код подтверждения";

export const PHONE_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE =
  "Превышено число попыток. Запросите код повторно";

export const PHONE_VERIFICATION_SENT_MESSAGE = "Код отправлен по SMS";

export const PHONE_VERIFICATION_SUCCESS_MESSAGE = "Телефон успешно подтверждён";

export const PHONE_NOT_SET_MESSAGE = "Укажите номер телефона";

export const PHONE_TAKEN_MESSAGE = "Этот номер телефона уже занят";

/** Владелец профиля: смена/очистка телефона только через `/auth/phone/bind/*`. */
export const PHONE_CHANGE_REQUIRES_OTP_MESSAGE =
  "Смена телефона доступна только после подтверждения SMS-кодом";

export const SMS_DELIVERY_UNAVAILABLE_MESSAGE =
  "Не удалось отправить SMS. Попробуйте позже";

export const PHONE_LOGIN_INVALID_MESSAGE = "Неверный телефон или пароль";

export const PHONE_OTP_LOGIN_GENERIC_MESSAGE =
  "Если номер зарегистрирован, код отправлен по SMS";
