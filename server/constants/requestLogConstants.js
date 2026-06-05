/** Заголовок корреляции запроса (входящий и ответ). */
export const REQUEST_ID_HEADER = "X-Request-Id";

export const REQUEST_ID_MIN_LENGTH = 8;
export const REQUEST_ID_MAX_LENGTH = 64;

/** Допустимые символы входящего id (клиент / шлюз). */
export const REQUEST_ID_INCOMING_PATTERN = /^[a-zA-Z0-9._-]+$/;
