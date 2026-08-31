/**
 * Курьер — не отдельная сущность, а состояние обычного пользователя:
 * зарегистрировал авто и прошёл модерацию. Отдельного кабинета нет.
 */

/** Заявку не подавал ни разу. */
export const COURIER_MODERATION_NONE = "none";
export const COURIER_MODERATION_PENDING = "pending";
export const COURIER_MODERATION_APPROVED = "approved";
export const COURIER_MODERATION_REJECTED = "rejected";

export const COURIER_MODERATION_STATUSES = [
  COURIER_MODERATION_NONE,
  COURIER_MODERATION_PENDING,
  COURIER_MODERATION_APPROVED,
  COURIER_MODERATION_REJECTED,
];

/** Что видит модератор в очереди: заявки, по которым надо решить. */
export const COURIER_MODERATION_QUEUE_STATUSES = [
  COURIER_MODERATION_PENDING,
  COURIER_MODERATION_REJECTED,
  COURIER_MODERATION_APPROVED,
];

export const COURIER_VEHICLE_MAKE_MAX_LENGTH = 60;
export const COURIER_VEHICLE_COLOR_MAX_LENGTH = 30;
/** «х123ум797» и подобное; с запасом на нестандартные серии и регионы. */
export const COURIER_VEHICLE_PLATE_MAX_LENGTH = 15;
export const COURIER_MODERATION_COMMENT_MAX_LENGTH = 500;

/**
 * Адрес в профиле обязателен: из него берётся регион, а без региона курьер
 * не увидит в «Обзоре» ни одного заказа.
 */
export const COURIER_ADDRESS_REQUIRED_MESSAGE =
  "Укажите адрес в профиле — по нему определяется ваш регион доставки";

export const COURIER_ALREADY_PENDING_MESSAGE =
  "Заявка уже на рассмотрении — дождитесь решения модератора";

export const COURIER_NOT_APPROVED_MESSAGE =
  "Принимать заказы могут только подтверждённые курьеры";

/** In-app: модератор принял решение по заявке курьера. */
export const IN_APP_NOTIFICATION_KIND_COURIER_MODERATION =
  "courier_moderation";
export const COURIER_MODERATION_MESSAGES = Object.freeze({
  [COURIER_MODERATION_APPROVED]: "Заявка курьера одобрена — можно брать заказы",
  [COURIER_MODERATION_REJECTED]: "Заявка курьера отклонена",
});
