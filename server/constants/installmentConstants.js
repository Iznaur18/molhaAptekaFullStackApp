/** Модерация программы рассрочки на товаре. */
export const INSTALLMENT_MODERATION_PENDING = "pending";
export const INSTALLMENT_MODERATION_APPROVED = "approved";
export const INSTALLMENT_MODERATION_REJECTED = "rejected";

export const INSTALLMENT_MODERATION_STATUSES = [
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_REJECTED,
];

/** Статусы контракта рассрочки. */
export const INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT =
  "pending_first_payment";
export const INSTALLMENT_CONTRACT_STATUS_ACTIVE = "active";
export const INSTALLMENT_CONTRACT_STATUS_COMPLETED = "completed";
export const INSTALLMENT_CONTRACT_STATUS_DEFAULTED = "defaulted";
export const INSTALLMENT_CONTRACT_STATUS_CANCELLED = "cancelled";

export const INSTALLMENT_CONTRACT_STATUSES = [
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_DEFAULTED,
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
];

/** Группа «активные» для `GET /installment/contracts/sales?status=in_progress`. */
export const INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS = "in_progress";

export const INSTALLMENT_SALES_LIST_FILTERS = [
  INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_DEFAULTED,
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
];

/** Статусы платежа в графике. */
export const INSTALLMENT_PAYMENT_STATUS_SCHEDULED = "scheduled";
export const INSTALLMENT_PAYMENT_STATUS_DUE = "due";
export const INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION = "pending_confirmation";
export const INSTALLMENT_PAYMENT_STATUS_PAID = "paid";
export const INSTALLMENT_PAYMENT_STATUS_OVERDUE = "overdue";
export const INSTALLMENT_PAYMENT_STATUS_WAIVED = "waived";

export const INSTALLMENT_PAYMENT_STATUSES = [
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_WAIVED,
];

/** Статусы спора. */
export const INSTALLMENT_DISPUTE_STATUS_OPEN = "open";
export const INSTALLMENT_DISPUTE_STATUS_RESOLVED = "resolved";

export const INSTALLMENT_DISPUTE_STATUSES = [
  INSTALLMENT_DISPUTE_STATUS_OPEN,
  INSTALLMENT_DISPUTE_STATUS_RESOLVED,
];

export const INSTALLMENT_PLANS_MAX = 5;
export const INSTALLMENT_MONTHS_MIN = 2;
export const INSTALLMENT_MONTHS_MAX = 24;
export const INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB = 100;
export const INSTALLMENT_PAYMENT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
export const INSTALLMENT_REMINDER_DAYS_BEFORE = 3;
export const INSTALLMENT_REMINDER_MS =
  INSTALLMENT_REMINDER_DAYS_BEFORE * 24 * 60 * 60 * 1000;
export const INSTALLMENT_CRON_INTERVAL_MS = 60 * 60 * 1000;

/** Публичные поля контрагента в карточке рассрочки. */
export const INSTALLMENT_COUNTERPARTY_PUBLIC_SELECT =
  "_id userName email userPhoneNumber";

export const INSTALLMENT_PLAN_TITLE_MAX_LENGTH = 80;

export const INSTALLMENT_SELLER_REQUIRES_CONFIRMED_MESSAGE =
  "Рассрочку могут включать только пользователи с подтверждёнными данными";
export const INSTALLMENT_BUYER_REQUIRES_CONFIRMED_MESSAGE =
  "Рассрочку могут оформлять только пользователи с подтверждёнными данными";
export const INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE =
  "Рассрочка для этого товара недоступна";
export const INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE =
  "Нельзя изменить планы: есть активные контракты рассрочки";
export const INSTALLMENT_PASSPORT_SHARE_CONSENT_REQUIRED_MESSAGE =
  "Нужно разрешение на передачу паспортных данных продавцу";
export const INSTALLMENT_BUYER_PASSPORT_NOT_AVAILABLE_MESSAGE =
  "Нет подтверждённых паспортных данных для передачи продавцу";
export const INSTALLMENT_ORDER_NOT_ACCEPTED_BY_SELLER_MESSAGE =
  "Рассрочка станет доступна после того, как продавец примет заказ";

/** In-app notification kinds. */
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_NEW_FOR_SELLER =
  "installment_new_for_seller";
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_PAYMENT_REMINDER =
  "installment_payment_reminder";
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_OVERDUE = "installment_overdue";
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_EARLY_PAYOFF =
  "installment_early_payoff";
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE =
  "installment_seller_message";
export const IN_APP_NOTIFICATION_KIND_INSTALLMENT_DISPUTE_OPENED =
  "installment_dispute_opened";

export const IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_NEW_FOR_SELLER =
  "Новая рассрочка по вашему товару";
export const IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_PAYMENT_REMINDER =
  "Через 3 дня платёж по рассрочке";
export const IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_OVERDUE =
  "Просрочка платежа по рассрочке";
export const IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_EARLY_PAYOFF =
  "Покупатель досрочно закрыл рассрочку";

/** Журнал операций рассрочки (audit + idempotency). */
export const INSTALLMENT_OP_MARK_PAYMENT_PAID = "mark_payment_paid";
export const INSTALLMENT_OP_CONFIRM_PAYMENT = "confirm_payment";
export const INSTALLMENT_OP_REJECT_PAYMENT = "reject_payment";
export const INSTALLMENT_OP_MARK_EARLY_PAYOFF = "mark_early_payoff";
export const INSTALLMENT_OP_CONFIRM_EARLY_PAYOFF = "confirm_early_payoff";
export const INSTALLMENT_OP_REJECT_EARLY_PAYOFF = "reject_early_payoff";
export const INSTALLMENT_OP_CANCEL_EARLY_PAYOFF = "cancel_early_payoff";

export const INSTALLMENT_OPERATION_ACTIONS = [
  INSTALLMENT_OP_MARK_PAYMENT_PAID,
  INSTALLMENT_OP_CONFIRM_PAYMENT,
  INSTALLMENT_OP_REJECT_PAYMENT,
  INSTALLMENT_OP_MARK_EARLY_PAYOFF,
  INSTALLMENT_OP_CONFIRM_EARLY_PAYOFF,
  INSTALLMENT_OP_REJECT_EARLY_PAYOFF,
  INSTALLMENT_OP_CANCEL_EARLY_PAYOFF,
];

export const INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH = 64;
