// Автосгенерировано из appUiCopy.js: домен «cart-checkout».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import { pluralizeRu } from "../../lib/pluralizeRu.js";

/** Страница «Корзина» */
export const CART_PAGE_UI = {
  TITLE: "Корзина",
  EMPTY: "Корзина пуста.",
  LOADING: "Загрузка корзины…",
  TOTAL_LABEL: "Итого",
  PAYABLE_LABEL: "К оплате",
  PRICE_LABEL: "Цена",
  DISCOUNT_LABEL: "Скидка",
  PROMO_DISCOUNT_LABEL: "Промокод",
  WHOLESALE_DISCOUNT_LABEL: "Оптовая скидка",
  DELIVERY_FEE_LABEL: "Доставка",
  DELIVERY_FEE_VALUE: "Индивидуальная плата при получении",
  WHOLESALE_LINE_BADGE: "Опт",
  /** @param {string} formatted */
  DISCOUNT_AMOUNT: (formatted) => `−${formatted}`,
  PURCHASABLE_TOTAL_LABEL: "К оформлению",
  FULL_TOTAL_HINT: "Итого в корзине",
  ITEMS_UNIT_FORMS: ["товар", "товара", "товаров"],
  /** @param {number} count */
  ITEMS_COUNT: (count) =>
    `${count} ${pluralizeRu(count, CART_PAGE_UI.ITEMS_UNIT_FORMS)}`,
  REMOVE_LINE_ARIA: "Удалить из корзины",
  SELECT_LINE_ARIA: "Выбрать товар для оформления",
  SELECT_ALL: "Выбрать все",
  /** @param {number} selected @param {number} total */
  SELECTED_COUNT: (selected, total) => `Выбрано ${selected} из ${total}`,
  CLEAR_ALL: "Очистить корзину",
  GO_TO_CATALOG: "Перейти в каталог",
  AUTH_REQUIRED: "Войдите, чтобы оформить заказ.",
  AUTH_LOGIN: "Войти",
  PRODUCT_DELETED_OR_HIDDEN: "Товар недоступен",
  CHECKOUT_BLOCKED_NO_PURCHASABLE: "Нет позиций для оформления",
  CHECKOUT_BLOCKED_NOTHING_SELECTED: "Выберите товары для оформления",
  CHECKOUT_BLOCKED_ALL_UNAVAILABLE: "Все товары недоступны",
  CHECKOUT_BLOCKED_OWN_PRODUCTS_ONLY: "Нельзя оформить заказ на свои товары",
  CHECKOUT_BLOCKED_MISSING_PICKUP:
    "У товаров нет адреса самовывоза — оформить заказ нельзя",
  SECTION_PICKUP: "Самовывоз",
  SECTION_DELIVERY: "Доставка",
  SECTION_DELIVERY_COURIER: "Курьеры Gitorg",
  SECTION_DELIVERY_SELLER: "Доставка продавцом",
  SECTION_METHOD_UNAVAILABLE: "Продавец не подключил этот способ",
  /** Корзина группируется по продавцам — по одному отправлению на каждого. */
  SECTION_SELLER_FALLBACK: "Продавец",
  SECTION_METHOD_LABEL: "Способ получения",
  /** @param {number} left */
  STOCK_REMAINING: (left) => `Осталось ${left} шт`,
  STOCK_QUANTITY_LIMITED: "Количество ограничено",
  CHECKOUT_OPEN: "Оформить заказ",
  CHECKOUT_SHEET_CLOSE: "Закрыть",
  CHECKOUT_LEGAL_HINT_PREFIX: "Нажимая на кнопку, вы соглашаетесь с ",
  CHECKOUT_LEGAL_PRIVACY_LINK: "Условиями обработки персональных данных",
  CHECKOUT_LEGAL_HINT_MIDDLE: ", а также с ",
  CHECKOUT_LEGAL_OFFER_LINK: "Условиями продажи",
};

/** Секция выигранных аукционных лотов в корзине */
export const CART_AUCTION_UI = {
  SECTION_TITLE: "Выигранные лоты",
  SECTION_HINT: "Каждый лот оформляется отдельным заказом",
  BADGE: "Аукцион",
  PRICE_LABEL: "Принятая цена",
  DEADLINE_LABEL: "Оплатить до",
  CHECKOUT: "Оформить",
  CHECKOUT_CANCEL: "Свернуть оформление",
  REMOVE: "Убрать",
  REMOVE_CONFIRM:
    "Убрать лот из корзины? Ставка будет отменена, продавец сможет принять предложение другого покупателя.",
  REMOVE_PENDING: "Убираем…",
  ORDER_PLACED: "Заказ по принятой цене оформлен",
  ERROR_GENERIC: "Не удалось выполнить действие",
};

/** Структурированный адрес (профиль) */
export const ADDRESS_STRUCTURED_UI = {
  SECTION_LABEL: "Адрес",
  FIELDSET_LEGEND: "Адрес",
  LABEL_CITY: "Город",
  LABEL_DISTRICT: "Район",
  LABEL_STREET: "Улица",
  LABEL_HOUSE: "Дом",
  LABEL_FLAT: "Квартира",
  PLACEHOLDER_CITY: "Москва",
  PLACEHOLDER_DISTRICT: "Необязательно",
  PLACEHOLDER_STREET: "ул. Примерная",
  PLACEHOLDER_HOUSE: "12",
  PLACEHOLDER_FLAT: "Необязательно",
};

/** DaData: адрес до дома */
export const ADDRESS_DELIVERY_UI = {
  LABEL_LINE: "Адрес (город, улица, дом)",
  PLACEHOLDER_LINE: "Начните вводить и выберите из списка",
  HINT_LINE: "Выберите вариант из подсказок DaData",
  LABEL_FLAT: "Квартира / офис",
  SUGGEST_LOADING: "Ищем адреса…",
  SUGGEST_ERROR: "Подсказки недоступны",
  SUGGEST_EMPTY: "Адрес не найден — уточните запрос",
  CLEAR_LINE_ARIA: "Очистить адрес",
  SERVICE_UNAVAILABLE:
    "Подсказки адреса временно недоступны — можно ввести адрес вручную или указать на карте",
  SERVICE_RETRY: "Повторить",
  MAP_ARIA: "Карта: укажите точку адреса",
  MAP_PICK_HINT: "Или укажите точку на карте",
  MAP_OPEN: "Указать на карте",
  MAP_DONE: "Готово",
  MAP_MY_LOCATION: "Мое местоположение",
  MAP_MY_LOCATION_LOADING: "Определяем местоположение…",
  MAP_MY_LOCATION_UNAVAILABLE: "Геолокация недоступна в этом браузере",
  MAP_MY_LOCATION_DENIED: "Разрешите доступ к геолокации в настройках браузера",
  MAP_MY_LOCATION_LOW_ACCURACY:
    "Местоположение неточное ({distance}). Сдвиньте метку на карте или введите адрес вручную",
  MAP_MY_LOCATION_TIMEOUT: "Не удалось определить местоположение — попробуйте ещё раз",
  MAP_MY_LOCATION_ERROR: "Не удалось определить местоположение",
  MAP_GEOLOCATE_LOADING: "Определяем адрес…",
  MAP_GEOLOCATE_NO_HOUSE:
    "Дом по точке не найден — адрес подставлен, уточните из списка при необходимости",
  MAP_GEOLOCATE_EMPTY:
    "Не удалось определить адрес — сдвиньте точку или введите вручную",
  MAP_GEOLOCATE_ERROR: "Не удалось определить адрес по карте",
};

/** Сохранённые адреса пользователя в профиле */
export const USER_SAVED_ADDRESSES_UI = {
  SECTION_LABEL: "Адреса",
  LABEL_DEFAULT: "По умолчанию",
  LABEL_NAME: "Метка",
  PLACEHOLDER_NAME: "Дом, работа…",
  ADD: "Добавить адрес",
  EDIT: "Изменить",
  REMOVE: "Удалить",
  SAVE: "Сохранить адрес",
  CANCEL: "Отмена",
  EMPTY: "Адреса не добавлены",
  /** @param {number} max */
  ERROR_MAX_COUNT: (max) => `Не больше ${max} адресов`,
  ERROR_DEFAULT_REQUIRED: "Укажите адрес по умолчанию",
  ERROR_DUPLICATE: "Такой адрес уже добавлен",
  /** @param {number} max */
  ERROR_LABEL_MAX: (max) => `Метка не длиннее ${max} символов`,
  REMOVE_CONFIRM: "Удалить этот адрес?",
  ERROR_DRAFT_OPEN: "Сохраните или отмените редактирование адреса",
  /** @param {string} line @param {string} flat */
  FORMAT_LINE: (line, flat) => {
    const trimmedFlat = String(flat ?? "").trim();
    return trimmedFlat ? `${line}, кв ${trimmedFlat}` : line;
  },
};

/** Форма оформления заказа */
export const CHECKOUT_FORM_UI = {
  HEADING: "Оформление заказа",
  LABEL_FULFILLMENT: "Способ получения",
  FULFILLMENT_PICKUP: "Самовывоз",
  FULFILLMENT_DELIVERY: "Доставка",
  FULFILLMENT_DELIVERY_SOON: "Скоро",
  FULFILLMENT_DELIVERY_UNAVAILABLE: "Доставка недоступна для выбранных товаров",
  FULFILLMENT_PICKUP_UNAVAILABLE: "Самовывоз недоступен для выбранных товаров",
  PICKUP_ADDRESS_LABEL: "Откуда забрать заказ",
  PICKUP_MULTI_HINT:
    "Несколько точек — каждый товар по своему адресу. Курьер поедет туда же.",
  LABEL_DELIVERY_ADDRESS: "Адрес доставки",
  PICKUP_NOT_NEEDED: "Заказ везут вам — точку самовывоза выбирать не нужно.",
  DELIVERY_NOT_NEEDED: "Заказ вы забираете сами — адрес доставки не нужен.",
  LABEL_SAVED_ADDRESSES: "Сохранённые адреса",
  SAVED_ADDRESS_OTHER: "Указать другой на карте",
  PLACEHOLDER_DELIVERY_ADDRESS: "Город, улица, дом",
  LABEL_FLAT: "Комментарий",
  PLACEHOLDER_FLAT: "подъезд, этаж, кв",
  LABEL_PAYMENT_METHOD: "Способ оплаты",
  PAYMENT_METHOD_CARD_SOON: "Скоро",
  LABEL_SHIPPING_PROVIDER: "Служба доставки",
  SHIPPING_PROVIDER_SELLER: "Продавцом",
  SHIPPING_PROVIDER_SOON: "Скоро",
  LABEL_SHIPPING_SERVICE: "Тип доставки",
  SHIPPING_SERVICE_COURIER: "Курьер",
  SHIPPING_SERVICE_PICKUP_POINT: "Пункт выдачи",
  SHIPPING_PROVIDER_HINT:
    "Сейчас товар доставляет продавец. СДЭК, Яндекс Доставка и Почта России появятся позже.",
  SUBMIT_IDLE: "Оформить заказ",
  SUBMIT_LOADING: "Оформляем…",
  SUCCESS: "Заказ успешно оформлен",
  ERROR_GENERIC: "Не удалось оформить заказ",
  ERROR_PICKUP_REQUIRED: "У товара нет адреса самовывоза — оформить заказ нельзя",
  ADDRESS_MAX_LENGTH: 30,
};

export const PRODUCT_PICKUP_UI = {
  FULFILLMENT_LEGEND: "Выберите способ получения",
  FULFILLMENT_DELIVERY_ANY: "Доставка",
  FULFILLMENT_PICKUP: "Самовывоз",
  FULFILLMENT_DELIVERY: "Доставка продавцом",
  FULFILLMENT_COURIER: "Курьеры Gitorg",
  FULFILLMENT_COURIER_HINT:
    "Заказ заберёт свободный курьер. Сумму доставки назначает покупатель, вам платить не нужно.",
  FULFILLMENT_CONFLICT_HINT:
    "Выберите одно: везёте сами или отдаёте курьеру.",
  CARRIERS_LEGEND: "Выберите способ доставки",
  CARRIERS_HINT: "Одна служба на товар. Курьеры Gitorg работают уже сейчас.",
  SOON_BADGE: " · скоро",
  METHODS_REQUIRED_HINT: "Можно выбрать несколько. Хотя бы один способ обязателен.",
  METHODS_BOTH_HINT:
    "Покупатель выберет самовывоз или доставку. Адрес ниже — точка самовывоза / отправления.",
  PICKUP_HINT: "Укажите адрес и отметьте точку на карте (или выберите из подсказок).",
  DELIVERY_CARRIERS_HINT:
    "Покупатель укажет адрес доставки. Службы СДЭК / Яндекс / Почта — позже; пока доставляете сами.",
  ADDRESS_LABEL: "Адрес продажи",
  ADDRESS_LABEL_WAREHOUSE: "Адрес точки отправления",
  SAVED_ADDRESSES_LABEL: "Ваши адреса",
  SAVED_ADDRESS_OTHER: "Указать другой на карте",
  LOCATIONS_SECTION_LABEL: "Точки самовывоза / отправления",
  LOCATIONS_EMPTY: "Добавьте хотя бы одну точку",
  LOCATION_DEFAULT: "По умолчанию",
  LOCATION_LABEL: "Метка",
  LOCATION_LABEL_PLACEHOLDER: "Склад, точка выдачи…",
  ADD_LOCATION: "Добавить точку на карте",
  ADD_FROM_SAVED: "Добавить из моих адресов",
  SAVED_ADDRESS_ADDED: "Добавлено",
  SAVED_ADDRESS_NO_GEO: "Укажите точку на карте",
  PICKUP_MULTI_HINT:
    "До 5 точек — покупатель выберет, откуда забрать заказ сам или откуда его заберёт курьер.",
  SAVE_LOCATION: "Сохранить точку",
  REMOVE_LOCATION_CONFIRM: "Удалить эту точку?",
  CHECKOUT_PICK_LOCATION: "Где забрать",
  MAP_ARIA: "Карта адреса продажи",
  DETAILS_TITLE: "Самовывоз",
  DETAILS_ROUTE: "Маршрут",
  DETAILS_OPEN_MAP: "Открыть на карте",
  DETAILS_NO_ADDRESS: "Адрес самовывоза не указан",
  DETAILS_DELIVERY_HINT: "Адрес укажете при оформлении заказа",
};

/** Сумму доставки назначает покупатель — тарифа по километражу нет. */
export const CART_DELIVERY_FEE_UI = {
  LABEL: "Курьеру за доставку",
  DECREASE: "Уменьшить на 25 ₽",
  INCREASE: "Увеличить на 25 ₽",
  HINT: "Чем выше сумма, тем быстрее найдётся курьер.",
  MIN_RUB: 100,
  STEP_RUB: 25,
};
