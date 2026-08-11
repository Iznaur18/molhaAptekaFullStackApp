/** POST /address/suggest|geolocate — DaData proxy, на пользователя или IP. */
export const ADDRESS_SUGGEST_RATE_LIMIT_PER_HOUR = 120;

/** GET /user/search — на пользователя или IP. */
export const USER_SEARCH_RATE_LIMIT_PER_15_MIN = 60;

/** POST intro-ad / site-header-banner-campaign / seller-personal-category. */
export const ADVERTISING_SUBMIT_RATE_LIMIT_PER_HOUR = 5;

/**
 * POST raffle unlock-create / premium purchase / product promotion request.
 */
export const MONEY_MUTATION_RATE_LIMIT_PER_HOUR = 10;

/** POST /product — создание карточки продавцом. */
export const PRODUCT_CREATE_RATE_LIMIT_PER_HOUR = 30;

/**
 * Installment: create contract + payment/dispute/message mutators.
 */
export const INSTALLMENT_ACTION_RATE_LIMIT_PER_HOUR = 60;

/** GET /product/ — каталог (scrape). */
export const CATALOG_LIST_RATE_LIMIT_PER_15_MIN = 300;

/** Лимит тела JSON для express.json(). */
export const API_JSON_BODY_LIMIT = "512kb";
