/** Срок действия кода сброса пароля (15 мин). */
export const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

/** Длина цифрового кода сброса. */
export const PASSWORD_RESET_CODE_LENGTH = 6;

/** Максимум неверных попыток ввода кода до повторной отправки. */
export const PASSWORD_RESET_MAX_ATTEMPTS = 10;

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "Если аккаунт с этим контактом существует, код отправлен";

export const PASSWORD_RESET_INVALID_CODE_MESSAGE =
  "Неверный или устаревший код подтверждения";

export const PASSWORD_RESET_ATTEMPTS_EXCEEDED_MESSAGE =
  "Превышено число попыток. Запросите код повторно";

export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Пароль изменён. Войдите с новым паролем";

export const PASSWORD_CHANGE_SUCCESS_MESSAGE = "Пароль успешно изменён";

export const PASSWORD_CHANGE_INVALID_CURRENT_MESSAGE = "Неверный текущий пароль";

export const PASSWORD_CHANGE_NO_PASSWORD_MESSAGE =
  "У аккаунта нет пароля. Задайте новый через восстановление";

export const PASSWORD_RESET_EMAIL_SUBJECT = "Сброс пароля — Gitorg";
