/** POST /address/suggest — DaData proxy, на пользователя или IP. */
export const ADDRESS_SUGGEST_RATE_LIMIT_PER_HOUR = 120;

/** GET /user/search — на пользователя или IP. */
export const USER_SEARCH_RATE_LIMIT_PER_15_MIN = 60;

/** Лимит тела JSON для express.json(). */
export const API_JSON_BODY_LIMIT = "512kb";
