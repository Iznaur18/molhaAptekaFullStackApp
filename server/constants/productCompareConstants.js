/** Минимум совпавших пар ключ+значение для попадания в сравнение. */
export const PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES = 3;

/** Сколько товаров вернуть клиенту. */
export const PRODUCT_COMPARE_RESULT_LIMIT = 10;

/** Сколько кандидатов той же категории сканировать на сервере. */
export const PRODUCT_COMPARE_CANDIDATE_SCAN_LIMIT = 200;

/** Минимальная длина токена названия. */
export const PRODUCT_COMPARE_NAME_TOKEN_MIN_LENGTH = 2;

/** Лимит запросов к /compare (дорогой публичный расчёт) на 15 минут / IP. */
export const PRODUCT_COMPARE_RATE_LIMIT_PER_15_MIN = 120;

/** Служебные слова (RU/EN), не участвуют в совпадении названия. */
export const PRODUCT_COMPARE_NAME_STOP_WORDS = new Set([
  "и",
  "или",
  "для",
  "на",
  "в",
  "во",
  "с",
  "со",
  "по",
  "от",
  "до",
  "к",
  "ко",
  "о",
  "об",
  "из",
  "у",
  "за",
  "при",
  "без",
  "над",
  "под",
  "про",
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "with",
]);
