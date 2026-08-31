// Автосгенерировано из appUiCopy.js: домен «orders».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import { pluralizeRuBall } from "../../lib/pluralizeRuBall.js";

/** Подписи карточки заказа (используется на Мои покупки и Все заказы) */
export const ORDER_CARD_UI = {
  ITEMS_HEADING: "Позиции",
  DETAILS_FOLD_SUMMARY: "Подробности заказа",
  TOTAL_LABEL: "Итого",
  ADDRESS_LABEL: "Адрес доставки",
  /** У отправления с самовывозом адрес другой — точка выдачи, а не адрес покупателя. */
  PICKUP_ADDRESS_LABEL: "Забрать по адресу",
  TRACKING_LABEL: "Трек-номер",
  PAYMENT_LABEL: "Оплата",
  STATUS_LABEL: "Статус",
  ITEM_STATUS_LABEL: "Статус позиции",
  ITEM_DELIVERED_AT_LABEL: "Доставлен",
  ITEM_CONFIRMED_AT_LABEL: "Подтверждён",
  CREATED_LABEL: "Создан",
  BUYER_LABEL: "Покупатель",
  SELLER_LABEL: "Продавец",
  // Раньше было «Принять», но теперь «Принят» — настоящая ступень лестницы,
  // и две разные кнопки под одним словом путали бы продавца.
  ACTION_SHIPPED: "Отгрузить",
  ACTION_DELIVERED: "Доставлен",
  ACTION_RETURN: "Вернулся",
  ACTION_RETURN_CONFIRM:
    "Оформить возврат? Товар вернётся в остаток, покупатель получит уведомление.",
  ACTION_REFUSE: "Отказаться",
  ACTION_REFUSE_CONFIRM:
    "Отказаться от товара? Заказ закроется, продавец получит уведомление. Отменить это будет нельзя.",
  ITEM_RETURNED_AT_LABEL: "Возвращён",
  ITEM_RETURNED_BY_BUYER: "покупатель отказался",
  ITEM_RETURNED_BY_SELLER: "оформил продавец",
  SHIPMENT_HEADING: "Отправление",
  SHIPMENT_ISSUE_CODE: "Выдать код курьеру",
  /** @param {string} code */
  SHIPMENT_CODE_SHOWN: (code) => `Назовите курьеру: ${code}`,
  /** @param {string} code */
  SHIPMENT_BUYER_CODE: (code) => `Код для курьера: ${code}`,
  SHIPMENT_BUYER_CODE_HINT:
    "Назовите его курьеру при получении — заказ закроется автоматически.",
  SHIPMENT_PICKUP: "Самовывоз",
  SHIPMENT_DELIVERY: "Доставка",
  ACTION_CONFIRM: "Подтвердить",
  ACTION_CANCEL: "Отменить",
  ACTION_PENDING: "Сохраняем…",
  CANCEL_CONFIRM: "Отменить заказ покупателя?",
  BUYER_CANCEL_CONFIRM: "Отменить заказ?",
  DELETED_PRODUCT_NAME: "Товар удалён",
  /** @param {number} points */
  LOYALTY_POINTS_LINE: (points) => `+${points} баллов за шт. (подтверждённому покупателю)`,
  AFFILIATE_LINE_ARIA: "Партнёрская атрибуция",
};

/** Страница «Мои покупки» */
export const MY_ORDERS_PAGE_UI = {
  TITLE: "Мои покупки",
  /** @param {number} count */
  COUNT: (count) => `${count} заказов`,
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
  /** @param {number} count */
  COUNT_ITEMS: (count) => `${count} заказов`,
  STATUS_FILTER_LABEL: "Фильтр по статусу",
  STATUS_FILTER_ALL: "Все статусы",
  OVERVIEW_IN_PROGRESS: "В работе",
  OVERVIEW_ATTENTION: "Нужно действие",
  OVERVIEW_TOTAL: "Сумма покупок",
  REFRESH: "Обновить",
  ATTENTION_FILTER_HINT: "Показаны заказы, где нужно ваше действие",
  COLLAPSED_CONFIRM: "Подтвердите получение",
  COLLAPSED_PENDING: "Ожидает отправки",
  COLLAPSED_SHIPPED: "Заказ в пути",
  /** @param {boolean} expanded */
  EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
  LOADING: "Загрузка покупок…",
  PRODUCT_DETAILS_LOADING: "Открываем карточку товара…",
  EMPTY: "У вас пока нет покупок.",
  EMPTY_BY_FILTER: "По выбранному статусу покупок нет.",
  /** @param {number} points */
  LOYALTY_POINTS_EARNED: (points) => `+${points} ${pluralizeRuBall(points)} лояльности`,
};

/** Страница «Мои продажи» */
export const MY_SALES_PAGE_UI = {
  TITLE: "Мои продажи",
  /** @param {number} count */
  COUNT: (count) => `${count} заказов`,
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
  /** @param {number} count */
  COUNT_ITEMS: (count) => `${count} заказов`,
  /** @param {number} count */
  TOTAL_SALES_COUNT: (count) => `Продаж: ${count}`,
  OVERVIEW_IN_PROGRESS: "В работе",
  OVERVIEW_ATTENTION: "Нужно действие",
  OVERVIEW_TOTAL: "Сумма продаж",
  REFRESH: "Обновить",
  ATTENTION_FILTER_HINT: "Показаны продажи, где нужно отметить отправку или доставку",
  COLLAPSED_SHIP: "Отметьте отправку",
  COLLAPSED_DELIVER: "Отметьте доставку",
  LOADING: "Загрузка продаж…",
  EMPTY: "У вас пока нет продаж.",
  EMPTY_BY_FILTER: "По выбранному статусу продаж нет.",
  EMPTY_BY_SEARCH: "По вашему запросу покупатель не найден.",
  STATUS_FILTER_LABEL: "Фильтр по статусу",
  STATUS_FILTER_ALL: "Все статусы",
  SEARCH_LABEL: "Поиск покупателя",
  SEARCH_PLACEHOLDER: "Имя, email или телефон покупателя…",
  SEARCH_DEBOUNCE_MS: 350,
};

/** Страница «Все заказы» (админ) */
export const ADMIN_ORDERS_PAGE_UI = {
  TITLE: "Все заказы",
  /** @param {number} count */
  COUNT: (count) => `${count} заказов`,
  LOADING: "Загрузка заказов…",
  EMPTY: "Заказов пока нет.",
  EMPTY_BY_FILTER: "По выбранному статусу заказов нет.",
  STATUS_FILTER_LABEL: "Фильтр по статусу",
  STATUS_FILTER_ALL: "Все статусы",
  STATUS_CHANGE_LABEL: "Сменить статус",
  STATUS_CHANGE_PENDING: "Сохраняем…",
  BUYER_LABEL: "Покупатель",
  ITEMS_HEADING: "Позиции",
  TOTAL_LABEL: "Итого",
  ADDRESS_LABEL: "Адрес доставки",
  PAYMENT_LABEL: "Оплата",
  CREATED_LABEL: "Создан",
  PAGE_LIMIT: 20,
};
