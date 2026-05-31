export const PRODUCT_PROMOTION_STATUS_PENDING_STAFF = 'pending_staff';
export const PRODUCT_PROMOTION_STATUS_ACTIVE = 'active';
export const PRODUCT_PROMOTION_STATUS_EXPIRED = 'expired';
export const PRODUCT_PROMOTION_STATUS_REJECTED = 'rejected';
export const PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN = 'cancelled_by_admin';

export const PRODUCT_PROMOTION_STATUSES = [
    PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    PRODUCT_PROMOTION_STATUS_ACTIVE,
    PRODUCT_PROMOTION_STATUS_EXPIRED,
    PRODUCT_PROMOTION_STATUS_REJECTED,
    PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
];

export const PRODUCT_PROMOTION_DEFAULT_TARIFFS = [
    { code: '24h', title: '24 часа', durationHours: 24, priceRub: 200, isActive: true },
    { code: '7d', title: '7 дней', durationHours: 24 * 7, priceRub: 1000, isActive: true },
    { code: '30d', title: '30 дней', durationHours: 24 * 30, priceRub: 3000, isActive: true },
];

export const PRODUCT_PROMOTION_REMINDER_HOURS = 1;

/** Оплата продвижения баллами: 1 ₽ тарифа = N баллов (×2 дороже номинала в рублях). */
export const PRODUCT_PROMOTION_POINTS_PER_RUBLE = 2;

export const PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS = 'points';
export const PRODUCT_PROMOTION_PAYMENT_METHOD_RUB = 'rub';

export const PRODUCT_PROMOTION_PAYMENT_METHODS = [
    PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
    PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
];

/**
 * @param {number} priceRub
 */
export const calculateProductPromotionPointsCost = (priceRub) => {
    const rub = Number(priceRub);
    if (!Number.isFinite(rub) || rub < 0) {
        return 0;
    }
    return Math.ceil(rub * PRODUCT_PROMOTION_POINTS_PER_RUBLE);
};
