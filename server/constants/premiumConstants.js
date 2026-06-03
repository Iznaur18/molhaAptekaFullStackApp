import { rublesToLoyaltyPoints } from './loyaltyPointsConstants.js';

/** Номинал подписки в рублях (1 ₽ = 1 балл при оплате баллами). */
export const PREMIUM_PRICE_RUB = 300;

export const PREMIUM_PRICE_POINTS = rublesToLoyaltyPoints(PREMIUM_PRICE_RUB);

export const PREMIUM_DURATION_CALENDAR_MONTHS = 1;

export const PREMIUM_EXPIRY_REMINDER_DAYS = 3;

export const PREMIUM_CRON_INTERVAL_MS = 15 * 60 * 1000;

export const PREMIUM_ALREADY_ACTIVE_MESSAGE =
    'Премиум уже активен. Продление будет доступно после окончания срока.';

export const PREMIUM_PURCHASE_SUCCESS_MESSAGE = 'Премиум активирован';

export const IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRING_SOON = 'premium_expiring_soon';
export const IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRED = 'premium_expired';
export const IN_APP_NOTIFICATION_KIND_PREMIUM_REVOKED_BY_STAFF =
    'premium_revoked_by_staff';

export const IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRING_SOON =
    'Премиум закончится примерно через 3 дня';
export const IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRED = 'Премиум закончился';
export const IN_APP_NOTIFICATION_MESSAGE_PREMIUM_REVOKED_BY_STAFF =
    'Премиум отключён модератором';
