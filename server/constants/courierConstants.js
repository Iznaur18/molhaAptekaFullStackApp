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

/**
 * Цена доставки: её назначает покупатель, а не тариф платформы.
 *
 * Тарифа по километражу нет намеренно — вместо него покупатель поднимает
 * сумму кнопками, пока курьер не найдётся. Крупногабарит никто не берёт за
 * минимум, и рынок решает это сам, без полей веса и объёма у товара.
 */
export const COURIER_DELIVERY_FEE_MIN_RUB = 100;
export const COURIER_DELIVERY_FEE_STEP_RUB = 25;
/** Верхняя граница — защита от опечатки в лишний ноль, а не бизнес-правило. */
export const COURIER_DELIVERY_FEE_MAX_RUB = 100_000;

export const COURIER_DELIVERY_FEE_FROZEN_MESSAGE =
  "Курьер уже принял заказ — сумму доставки изменить нельзя";
export const COURIER_DELIVERY_FEE_DECREASE_MESSAGE =
  "Сумму доставки можно только повысить";

/** Радиус «Обзора»: дальше курьеру ехать незачем. */
export const COURIER_OVERVIEW_RADIUS_KM = 50;

/** In-app: у курьера забрали отправление до передачи товара. */
export const IN_APP_NOTIFICATION_KIND_COURIER_REPLACED = "courier_replaced";
export const COURIER_REPLACED_MESSAGE =
  "Заказ передан другому курьеру — он снова в общем списке";

export const COURIER_REPLACE_TOO_LATE_MESSAGE =
  "Товар уже у курьера — это возврат, а не смена курьера";
export const COURIER_REPLACE_NO_COURIER_MESSAGE =
  "Курьер ещё не принял отправление";

/**
 * Сторона сделки не возит собственный заказ.
 *
 * Рукопожатие кодами доказывает, что продавец и курьер стояли рядом. Если это
 * один человек, он называет код сам себе, и доказательство исчезает. У
 * покупателя то же самое на вручении. Для «везу сам» есть отдельный способ —
 * доставка продавцом.
 */
export const COURIER_IS_ORDER_PARTY_MESSAGE =
  "Свой заказ курьером не возят: для этого есть доставка продавцом";

/** Сколько отправление может висеть у курьера, прежде чем это станет спором. */
export const COURIER_STUCK_SHIPMENT_HOURS = 24;

/** Как часто таймер ищет зависшие отправления. */
export const COURIER_STUCK_SHIPMENT_CRON_INTERVAL_MS = 30 * 60 * 1000;

export const COURIER_DISPUTE_REASON_MAX_LENGTH = 500;
export const COURIER_DISPUTE_TOO_EARLY_MESSAGE =
  "Спор открывают, когда товар уже у курьера";
export const COURIER_DISPUTE_ALREADY_OPEN_MESSAGE = "Спор уже открыт";

/** In-app: курьер отказался от принятой заявки. */
export const IN_APP_NOTIFICATION_KIND_COURIER_DECLINED = "courier_declined";
export const COURIER_DECLINED_MESSAGE =
  "Курьер отказался от заказа — он снова в общем списке";

/** In-app: по отправлению открыт спор. */
export const IN_APP_NOTIFICATION_KIND_SHIPMENT_DISPUTED = "shipment_disputed";
export const SHIPMENT_DISPUTED_MESSAGE =
  "По заказу открыт спор — с ним разбирается модератор";
