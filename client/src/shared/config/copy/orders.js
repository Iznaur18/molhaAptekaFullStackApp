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
  ORDER_NUMBER_LABEL: "Номер заказа",
  /** @param {string} number */
  ORDER_NUMBER: (number) => `№ ${number}`,
  BUYER_LABEL: "Покупатель",
  SELLER_LABEL: "Продавец",
  // Раньше было «Принять», но теперь «Принят» — настоящая ступень лестницы,
  // и две разные кнопки под одним словом путали бы продавца.
  ACTION_SHIPPED: "Отгрузить",
  ACTION_DELIVERED: "Доставлен",
  ACTION_HANDED_TO_BUYER: "Выдал покупателю",
  ACTION_RETURN: "Вернулся",
  ACTION_RETURN_CONFIRM:
    "Оформить возврат? Товар вернётся в остаток, покупатель получит уведомление.",
  ACTION_REFUSE: "Отказаться",
  ACTION_REFUSE_CONFIRM:
    "Отказаться от товара? Заказ закроется, продавец получит уведомление. Отменить это будет нельзя.",
  ITEM_RETURNED_AT_LABEL: "Возвращён",
  ITEM_RETURNED_BY_BUYER: "покупатель отказался",
  ITEM_RETURNED_BY_SELLER: "оформил продавец",
  SHIPMENT_COURIER: "Курьер",
  /** @param {string} make @param {string} color @param {string} plate */
  SHIPMENT_COURIER_CAR: (make, color, plate) =>
    [make, color, plate].filter(Boolean).join(", "),
  /** @param {number} rating */
  SHIPMENT_COURIER_RATING: (rating) => `★ ${rating}`,
  SHIPMENT_HEADING: "Отправление",
  SHIPMENT_ISSUE_CODE: "Выдать код курьеру",
  SHIPMENT_REPLACE_COURIER: "Сменить курьера",
  SHIPMENT_PAYMENT_CONFIRM: "Оплата получена",
  SHIPMENT_PAYMENT_CONFIRMED: "Оплата подтверждена",
  /** @param {string} requisites */
  SHIPMENT_PAY_TO: (requisites) => `Перевести продавцу: ${requisites}`,
  AWAITING_ACCEPT: "Ждём подтверждения продавца",
  AWAITING_ACCEPT_BUYER_HINT:
    "Продавец проверяет, что товар есть. Оплата откроется после подтверждения — так не придётся возвращать деньги, если товара не окажется.",
  AWAITING_ACCEPT_SELLER_HINT:
    "Подтвердите заказ, если товар есть — покупатель сможет оплатить. Если товара нет, отмените заказ: деньги ещё не списаны.",
  AWAITING_PREPAYMENT: "Ожидает оплаты",
  AWAITING_PREPAYMENT_BUYER_HINT:
    "Продавец подтвердил заказ. Оплатите — и он начнёт собирать.",
  AWAITING_PREPAYMENT_SELLER_HINT:
    "Заказ подтверждён, ждём оплату от покупателя. Собирать и отгружать его пока рано.",
  AWAITING_COURIER: "Ищем курьера",
  AWAITING_COURIER_BUYER_HINT:
    "Ищем курьера. Можно поднять оплату за доставку — так заказ быстрее возьмут.",
  AWAITING_COURIER_SELLER_HINT:
    "Ждём, пока курьер примет заказ в «Свободные заказы».",
  PAY_NOW: "Оплатить",
  PAY_NOW_PENDING: "Открываем оплату…",
  SHIPMENT_PAY_TO_HINT:
    "Курьер отдаст заказ, когда продавец подтвердит перевод.",
  SHIPMENT_PAYMENT_RECEIVED_BY_SELLER: "Продавец подтвердил, что перевод дошёл",
  SHIPMENT_PAYMENT_RECEIVED_HINT: "Больше переводить ничего не нужно.",
  /** @param {string} fee */
  SHIPMENT_FEE: (fee) => `Курьеру за доставку: ${fee}`,
  /** Доставка по тарифу продавца — платится продавцу, а не курьеру. */
  SELLER_DELIVERY_FEE: (fee) => `Доставка продавцом: ${fee}`,
  SHIPMENT_FEE_RAISE: "+25 ₽",
  SHIPMENT_FEE_HINT:
    "Заказ долго никто не берёт? Поднимите сумму — снизить её потом нельзя.",
  SHIPMENT_REPLACE_CONFIRM:
    "Сменить курьера? Заказ вернётся в общий список, а этот курьер больше не сможет его взять.",
  /** @param {string} code */
  SHIPMENT_CODE_SHOWN: (code) => `Назовите курьеру: ${code}`,
  /** @param {string} code */
  SHIPMENT_BUYER_CODE: (code) => `Код для курьера: ${code}`,
  SHIPMENT_BUYER_CODE_HINT:
    "Назовите его курьеру при получении — заказ закроется автоматически.",
  COURIER_CONFIRM_VIA_CODE_HINT:
    "Заказ закроет курьер, когда введёт ваш код. Кнопка «Подтвердить» здесь не нужна.",
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
