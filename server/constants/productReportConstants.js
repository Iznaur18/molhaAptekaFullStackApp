export const PRODUCT_REPORT_STATUS_PENDING = "pending";
export const PRODUCT_REPORT_STATUS_DISMISSED = "dismissed";
export const PRODUCT_REPORT_STATUS_RESOLVED = "resolved";

export const PRODUCT_REPORT_STATUSES = [
  PRODUCT_REPORT_STATUS_PENDING,
  PRODUCT_REPORT_STATUS_DISMISSED,
  PRODUCT_REPORT_STATUS_RESOLVED,
];

export const PRODUCT_REPORT_RESOLUTION_DISMISS = "dismiss";
export const PRODUCT_REPORT_RESOLUTION_HIDE = "hide";
export const PRODUCT_REPORT_RESOLUTION_REJECT = "reject";

export const PRODUCT_REPORT_RESOLUTIONS = [
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
];

/** Макс. символов в тексте жалобы (`reportText`). */
export const PRODUCT_REPORT_TEXT_MAX_CHARS = 1000;

/** Макс. жалоб с одного аккаунта за час (rate limit). */
export const PRODUCT_REPORT_RATE_LIMIT_PER_HOUR = 10;

export const PRODUCT_REPORT_ALREADY_MESSAGE = "Вы уже жаловались";

export const IN_APP_NOTIFICATION_KIND_SELLER_REPORT = "product_report_seller";
export const IN_APP_NOTIFICATION_KIND_REPORTER_RESOLVED =
  "product_report_reporter_resolved";

export const IN_APP_NOTIFICATION_MESSAGE_SELLER = "На ваш товар поступила жалоба";
export const IN_APP_NOTIFICATION_MESSAGE_REPORTER_RESOLVED = "Жалоба рассмотрена";
