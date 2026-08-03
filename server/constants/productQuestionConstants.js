export const PRODUCT_QUESTION_STATUS_PENDING = "pending";
export const PRODUCT_QUESTION_STATUS_ANSWERED = "answered";
export const PRODUCT_QUESTION_STATUS_HIDDEN = "hidden";

export const PRODUCT_QUESTION_STATUSES = [
  PRODUCT_QUESTION_STATUS_PENDING,
  PRODUCT_QUESTION_STATUS_ANSWERED,
  PRODUCT_QUESTION_STATUS_HIDDEN,
];

/** Статусы, занимающие слот в лимите на товар. */
export const PRODUCT_QUESTION_ACTIVE_STATUSES = [
  PRODUCT_QUESTION_STATUS_PENDING,
  PRODUCT_QUESTION_STATUS_ANSWERED,
];

export const PRODUCT_QUESTION_TEXT_MAX_LENGTH = 300;
export const PRODUCT_ANSWER_TEXT_MAX_LENGTH = 300;
export const PRODUCT_QUESTIONS_MAX_PER_PRODUCT = 50;

export const PRODUCT_QUESTION_PAGE_DEFAULT = 1;
export const PRODUCT_QUESTION_LIMIT_DEFAULT = 20;
export const PRODUCT_QUESTION_LIMIT_MAX = 50;

/** Окно, в течение которого автор может удалить свой вопрос. */
export const PRODUCT_QUESTION_DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const PRODUCT_QUESTION_RATE_LIMIT_PER_HOUR = 20;

export const PRODUCT_QUESTION_MESSAGES = {
  PRODUCT_NOT_FOUND: "Товар не найден",
  QUESTION_NOT_FOUND: "Вопрос не найден",
  QA_DISABLED: "Вопросы и ответы отключены для этого товара",
  NOT_APPROVED: "Вопросы доступны только на одобренные товары",
  OWN_PRODUCT: "Нельзя задать вопрос на свой товар",
  LIMIT_REACHED: `Достигнут лимит в ${PRODUCT_QUESTIONS_MAX_PER_PRODUCT} вопросов на товар`,
  ONLY_SELLER_CAN_ANSWER: "Отвечать может только продавец товара",
  CANNOT_ANSWER_HIDDEN: "Нельзя ответить на скрытый вопрос",
  ONLY_AUTHOR_CAN_DELETE: "Удалить можно только свой вопрос",
  DELETE_WINDOW_EXPIRED: "Срок удаления вопроса истёк",
  NOT_ALLOWED_TO_HIDE: "Скрывать вопросы может продавец или модератор",
  DELETED_AUTHOR_NAME: "Пользователь удалён",
};
