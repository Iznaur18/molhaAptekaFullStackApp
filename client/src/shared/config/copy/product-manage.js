// Автосгенерировано из appUiCopy.js: домен «product-manage».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import { pluralizeRu } from "../../lib/pluralizeRu.js";

export const SELLER_PRODUCTS_PAGE_UI = {
  TITLE: "Товары продавца",
  BACK_ARIA: "Назад",
  LOADING: "Загрузка…",
  LOGIN_HINT: "Войдите, чтобы посмотреть товары продавца.",
  LOGIN_BUTTON: "Войти",
  FETCH_PROFILE_FALLBACK: "Не удалось загрузить профиль продавца",
  EMPTY: "У продавца пока нет товаров в каталоге.",
  SHARE_LINK_ARIA: "Ссылка",
  SHARE_LINK_COPIED_ARIA: "Ссылка скопирована",
  /** @param {string} userName */
  TITLE_FOR: (userName) => `Товары ${userName}`,
  SHELF_FILTER_ARIA: "Полки продавца",
  SHELF_FILTER_ALL: "Все",
  STATS_ARIA: "Статистика продавца",
  STATS_VOTE_RATING: "Рейтинг голосов",
};

export const SELLER_SHELF_UI = {
  TITLE: "Полки",
  HINT: "Группируйте товары для фильтров на витрине. До 10 полок.",
  CREATE_PLACEHOLDER: "Название полки",
  CREATE: "Создать",
  CREATE_PENDING: "Создаём…",
  RENAME: "Переименовать",
  RENAME_LABEL: "Название полки",
  RENAME_NAME_ARIA: "Изменить название полки",
  RENAME_TAP_HINT: "Изменить",
  RENAME_PENDING: "Сохраняем…",
  SAVE_NAME: "Сохранить",
  DELETE: "Удалить",
  DELETE_PENDING: "Удаляем…",
  DELETE_CONFIRM: "Удалить полку? Товары останутся без полки.",
  MOVE_LEFT_ARIA: "Левее",
  MOVE_RIGHT_ARIA: "Правее",
  ASSIGN: "Товары",
  ASSIGN_MODAL_TITLE: "Полка",
  ASSIGN_TITLE: (name) => `Полка «${name}»`,
  ASSIGN_SAVE: "Сохранить",
  ASSIGN_CANCEL: "Отменить",
  ASSIGN_PENDING: "Сохраняем…",
  ASSIGN_EMPTY: "Нет товаров для назначения.",
  ASSIGN_OTHER_SHELF: "В другой полке",
  LOADING: "Загрузка полок…",
  LOAD_ERROR: "Не удалось загрузить полки",
  EMPTY: "Полок пока нет — создайте первую.",
  /** @param {number} count */
  PRODUCT_COUNT: (count) => `${count}`,
  NAME_TOO_LONG: "Максимум 30 символов",
  LIMIT_REACHED: "Достигнут лимит 10 полок",
  /** @param {boolean} expanded */
  EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
  SHELF_UNIT_FORMS: /** @type {const} */ (["полка", "полки", "полок"]),
  /** @param {number} count */
  COLLAPSED_COUNT: (count) =>
    `${count} ${pluralizeRu(count, SELLER_SHELF_UI.SHELF_UNIT_FORMS)}`,
};

export const PRODUCT_PROMOTIONS_STAFF_PAGE_UI = {
  TITLE: "Продвижение товаров",
  EMPTY: "Нет заявок на продвижение.",
  LOADING: "Загрузка…",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  PENDING: "Сохраняем…",
  /** @param {number} count */
  TAB_BADGE: (count) => (count > 99 ? "99+" : String(count)),
  ROW_PRODUCT: "Товар",
  ROW_TARIFF: "Пакет",
  ROW_PRICE: "Тариф (₽)",
  ROW_POINTS: "Оплата баллами",
  ROW_PAYMENT: "Способ оплаты",
  PAYMENT_RUB: "Рубли",
  PAYMENT_POINTS: "Баллы",
};

export const PRODUCT_PROMOTION_UI = {
  MODAL_TITLE: "Продвижение товара",
  TAB_PROMOTION: "Продвижение",
  TAB_MANAGE: "Управление",
  TABS_ARIA: "Разделы модалки продвижения",
  MODAL_SUBTITLE: (productName) => `Товар: ${productName || "Без названия"}`,
  BALANCE_LABEL: "Ваш баланс",
  /** @param {number} balance */
  BALANCE_POINTS: (balance) => `${balance} баллов`,
  TIER_LABEL: "Уровень продвижения",
  /** @param {string} percent */
  TIER_RATE_HINT: (percent) => `${percent}% от цены товара`,
  /** @param {string} title @param {string} description */
  TIER_OPTION: (title, description) => `${title} — ${description}`,
  DURATION_LABEL: "Срок",
  /** @param {number} pricePoints */
  DURATION_PRICE_POINTS: (pricePoints) => `${pricePoints} руб.`,
  /** @param {string} title @param {number} pricePoints */
  DURATION_OPTION_POINTS: (title, pricePoints) => `${title} — ${pricePoints} руб.`,
  SUMMARY_TIER: "Уровень",
  SUMMARY_DURATION: "Срок действия",
  TOTAL_LABEL: "К оплате",
  /** @param {number} pricePoints */
  TOTAL_POINTS: (pricePoints) => `${pricePoints} руб.`,
  TARIFF_DURATION: (durationHours) => `${durationHours} ч.`,
  INSUFFICIENT_POINTS: (required, balance) =>
    `Недостаточно баллов: нужно ${required}, у вас ${balance}.`,
  SUBMIT_POINTS: "Оплатить",
  SUBMIT_PENDING: "Отправка…",
  CANCEL: "Отмена",
  CLOSE: "Закрыть",
};

export const PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI = {
  TITLE: "Кнопки управления товаром",
  HINT: "Фон фиксирован по типу кнопки. Можно загрузить иллюстрацию справа.",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить оформление кнопок",
};

export const PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI = {
  LABEL_IMAGE: "Иллюстрация справа",
  SAVE: "Сохранить",
  SAVING: "Сохранение…",
  SAVED: "Сохранено",
  SAVE_ERROR: "Не удалось сохранить",
  RESET_IMAGE: "Сбросить картинку",
};
