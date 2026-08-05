/** Срок действия кода подтверждения email (24 ч). */
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Длина цифрового кода подтверждения email. */
export const EMAIL_VERIFICATION_CODE_LENGTH = 6;

/** Максимум неверных попыток ввода кода до повторной отправки. */
export const EMAIL_VERIFICATION_MAX_ATTEMPTS = 10;

/** Лимит повторной отправки письма с одного аккаунта в час. */
export const EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR = 5;

export const EMAIL_NOT_VERIFIED_MESSAGE =
  "Подтвердите email перед оформлением заказа или рассрочки";

export const EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE = "Email уже подтверждён";

export const EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE =
  "Ссылка подтверждения недействительна или устарела";

export const EMAIL_VERIFICATION_INVALID_CODE_MESSAGE =
  "Неверный или устаревший код подтверждения";

export const EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE =
  "Превышено число попыток. Отправьте письмо повторно";

export const EMAIL_VERIFICATION_SENT_MESSAGE = "Письмо с подтверждением отправлено";

export const EMAIL_VERIFICATION_SUCCESS_MESSAGE = "Email успешно подтверждён";

export const EMAIL_NOT_SET_MESSAGE = "Укажите email";

export const EMAIL_TAKEN_MESSAGE = "Этот email уже занят";

/** Владелец профиля: смена email только через `/auth/email/bind/*`. */
export const EMAIL_CHANGE_REQUIRES_OTP_MESSAGE =
  "Смена email доступна только после подтверждения кодом из письма";

/**
 * Срок жизни заявки на регистрацию до подтверждения email.
 * По истечении MongoDB удаляет заявку по TTL-индексу — данные
 * неподтверждённой регистрации не остаются в базе.
 */
export const PENDING_REGISTRATION_TTL_MS = EMAIL_VERIFICATION_TOKEN_TTL_MS;

export const PENDING_REGISTRATION_NOT_FOUND_MESSAGE =
  "Заявка на регистрацию не найдена или устарела. Зарегистрируйтесь заново";

export const PENDING_REGISTRATION_TAKEN_MESSAGE =
  "Пользователь с таким email или userName или userPhoneNumber уже существует";
