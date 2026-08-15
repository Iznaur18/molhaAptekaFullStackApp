// Автосгенерировано из appUiCopy.js: домен «wishlist-notifications».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** In-app уведомления */
export const IN_APP_NOTIFICATIONS_UI = {
  SECTION_ARIA: "Уведомления",
};

export const NOTIFICATIONS_PAGE_UI = {
  EMPTY: "Нет новых уведомлений.",
  CLEAR: "Очистить",
  CLEAR_PENDING: "Очищаем…",
  CLEAR_ARIA: "Отметить все уведомления прочитанными",
};

export const WISHLIST_PAGE_UI = {
  LOADING: "Загрузка списка…",
  EMPTY: "Список пуст. Добавляйте товары из каталога.",
  FETCH_FALLBACK: "Не удалось загрузить список желаний",
  LOGIN_HINT: "Войдите, чтобы видеть «Мои желания».",
  LOGIN_BUTTON: "Войти",
  /** @param {string} title */
  REMOVE_ARIA: (title) => `Убрать «${title}» из желаний`,
  HERO_CAPTION: "Мои желания",
  /** @type {readonly [string, string, string]} */
  HERO_UNIT_FORMS: ["товар", "товара", "товаров"],
  HERO_INFO: "Сохранённые товары из каталога — возвращайтесь к ним в любой момент.",
};
