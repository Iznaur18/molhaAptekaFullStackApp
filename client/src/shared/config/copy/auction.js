// Автосгенерировано из appUiCopy.js: домен «auction».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Вкладка «Аукцион» в профиле */
export const AUCTION_PAGE_UI = {
  TITLE: "Аукцион",
  /** @param {number} count */
  COUNT_BIDS: (count) => `${count} моих ставок`,
  /** @param {number} count */
  COUNT_OFFERS: (count) => `${count} входящих`,
  BID_PRICE_LABEL: "Ставка",
  LOADING: "Загрузка аукциона…",
  ERROR_GENERIC: "Не удалось выполнить действие",
  BUYER_SECTION_TITLE: "Мои ставки",
  SELLER_SECTION_TITLE: "Ставки покупателей",
  BUYER_EMPTY: "У вас пока нет активных ставок",
  SELLER_EMPTY: "Входящих ставок пока нет",
  BOTH_EMPTY: "Активных ставок пока нет",
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
  /** @param {number} count */
  COUNT_ITEMS: (count) => `${count} записей`,
  VIEW_FILTER_LABEL: "Раздел",
  VIEW_FILTER_ALL: "Все",
  VIEW_FILTER_BUYER: "Мои ставки",
  VIEW_FILTER_SELLER: "Входящие",
  OVERVIEW_BUYER_BIDS: "Мои ставки",
  OVERVIEW_INCOMING: "Входящие",
  OVERVIEW_ATTENTION: "Нужно действие",
  REFRESH: "Обновить",
  ATTENTION_FILTER_HINT: "Показаны ставки, где нужно ваше действие",
  /** @param {string} price */
  COLLAPSED_BUYER_PAY: (price) => `В корзине: ${price}`,
  COLLAPSED_BUYER_PENDING: "Ожидает ответа продавца",
  /** @param {string} price */
  COLLAPSED_SELLER_REVIEW: (price) => `Подтвердите ставку ${price}`,
  /** @param {boolean} expanded */
  EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
  LOGIN_HINT: "Войдите, чтобы видеть аукцион.",
  LOGIN_BUTTON: "Войти",
  EMPTY_BY_FILTER: "По выбранному фильтру ставок нет.",
  /** @param {number} count */
  TAB_BADGE: (count) => (count > 99 ? "99+" : String(count)),
  PAY_DEADLINE_LABEL: "Оплатить до",
  EDIT_PRICE_LABEL: "Новая цена, ₽",
};
