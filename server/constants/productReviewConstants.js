export const PRODUCT_REVIEW_STATUS_PUBLISHED = "published";
export const PRODUCT_REVIEW_STATUS_HIDDEN = "hidden";

export const PRODUCT_REVIEW_STATUSES = [
  PRODUCT_REVIEW_STATUS_PUBLISHED,
  PRODUCT_REVIEW_STATUS_HIDDEN,
];

/** SSOT: `contract/src/productReview.js`. */
export {
  PRODUCT_REVIEW_RATING_MIN,
  PRODUCT_REVIEW_RATING_MAX,
  PRODUCT_REVIEW_TEXT_MAX_LENGTH,
  PRODUCT_REVIEW_LIMIT_DEFAULT,
  PRODUCT_REVIEW_LIMIT_MAX,
} from "@molha/api-contract";

export const PRODUCT_REVIEW_PAGE_DEFAULT = 1;

/** Окно редактирования и удаления своего отзыва. */
export const PRODUCT_REVIEW_EDIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const PRODUCT_REVIEW_RATE_LIMIT_PER_HOUR = 30;

export const PRODUCT_REVIEW_MESSAGES = {
  PRODUCT_NOT_FOUND: "Товар не найден",
  REVIEW_NOT_FOUND: "Отзыв не найден",
  NOT_APPROVED: "Отзывы доступны только на одобренные товары",
  OWN_PRODUCT: "Нельзя оставить отзыв на свой товар",
  DATA_NOT_CONFIRMED: "Отзыв доступен только пользователям с подтверждёнными данными",
  NOT_DELIVERED: "Отзыв можно оставить после получения товара",
  ALREADY_EXISTS: "Вы уже оставили отзыв на этот товар",
  EDIT_WINDOW_EXPIRED: "Срок редактирования отзыва истёк",
};
