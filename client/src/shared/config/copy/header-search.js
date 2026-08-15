// Автосгенерировано из appUiCopy.js: домен «header-search».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Поиск пользователей (`GET /user/search`) */
export const USER_SEARCH_UI = {
  API_PAGE_LIMIT: 100,
};

/** Поле поиска пользователей */
export const USER_SEARCH_INPUT_UI = {
  PLACEHOLDER: "Поиск по нику, телефону или email…",
  ARIA_LABEL: "Поиск пользователей",
  CLEAR_ARIA: "Очистить поле поиска",
  PENDING_ARIA: "Идёт поиск",
};

/** Поле поиска товаров */
export const PRODUCT_SEARCH_INPUT_UI = {
  PLACEHOLDER: "Поиск товара по названию…",
  ARIA_LABEL: "Поиск товаров",
  CLEAR_ARIA: "Очистить поле поиска",
  PENDING_ARIA: "Идёт поиск",
};

/** Кнопка корзины в шапке */
export const HEADER_CART_BUTTON_UI = {
  ARIA: "Открыть корзину",
  COUNT_ARIA: "Товаров в корзине",
};

/** Кнопка «Разместить товар» в шапке */
export const HEADER_PLACE_PRODUCT_BUTTON_UI = {
  ARIA: "Разместить товар",
  ARIA_LOGIN_REQUIRED: "Войти, чтобы разместить товар",
};

/** Кнопка «Мой профиль» в шапке */
export const HEADER_PROFILE_BUTTON_UI = {
  ARIA: "Мой профиль",
};

/** Кнопка «Пользователи» / stretch-меню в шапке */
export const HEADER_USERS_BUTTON_UI = {
  ARIA: "Пользователи",
  TOGGLE_ARIA: "Действия аккаунта",
  MENU_ARIA: "Действия аккаунта",
  MENU_CLOSE_ARIA: "Закрыть меню",
  MENU_ITEM_USERS_ARIA: "Пользователи",
  MENU_ITEM_TERMS_ARIA: "Пользовательское соглашение",
  MENU_ITEM_FAQ_ARIA: "Частые вопросы",
  MENU_ITEM_NOTIFICATIONS_ARIA: "Уведомления",
  MENU_ITEM_PLACEHOLDER_ARIA: (index) => `Пункт ${index} (скоро)`,
};

export const HEADER_NOTIFICATIONS_BUTTON_UI = {
  ARIA: "Уведомления",
  COUNT_ARIA: "Непрочитанных уведомлений",
  /** @param {number} n */
  BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

export const HEADER_WISHLIST_BUTTON_UI = {
  ARIA: "Мои желания",
  COUNT_ARIA: "Товаров в списке желаний",
};
