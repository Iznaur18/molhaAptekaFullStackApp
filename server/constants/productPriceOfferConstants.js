export const PRICE_OFFER_STATUS_PENDING = 'pending';
export const PRICE_OFFER_STATUS_ACCEPTED = 'accepted';
export const PRICE_OFFER_STATUS_REJECTED = 'rejected';
export const PRICE_OFFER_STATUS_CANCELLED = 'cancelled';

export const PRICE_OFFER_STATUSES = [
    PRICE_OFFER_STATUS_PENDING,
    PRICE_OFFER_STATUS_ACCEPTED,
    PRICE_OFFER_STATUS_REJECTED,
    PRICE_OFFER_STATUS_CANCELLED,
];

export const PRICE_OFFER_TOP_PUBLIC_LIMIT = 10;

/** POST/PATCH предложений цены с одного аккаунта за час. */
export const PRICE_OFFER_RATE_LIMIT_PER_HOUR = 15;

/** Срок оплаты после принятия продавцом (мс). */
export const PRICE_OFFER_PAYMENT_DEADLINE_MS = 24 * 60 * 60 * 1000;

export const IN_APP_NOTIFICATION_KIND_PRICE_OFFER_SELLER =
    'price_offer_seller';
export const IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED =
    'price_offer_accepted';
export const IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED =
    'price_offer_rejected';
export const IN_APP_NOTIFICATION_KIND_PRICE_OFFER_OUTBID_WON =
    'price_offer_outbid_won';

export const IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_SELLER =
    'Новое предложение цены на ваш товар';
export const IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED =
    'Продавец принял вашу цену — оформите оплату';
export const IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED =
    'Предложение цены отклонено';
export const IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_OUTBID_WON =
    'Товар куплен по другой ставке — ваше предложение снято';
