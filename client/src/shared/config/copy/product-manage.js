// Автосгенерировано из appUiCopy.js: домен «product-manage».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

export const SELLER_PRODUCTS_PAGE_UI = {
  TITLE: "Товары продавца",
  BACK_ARIA: "Назад",
  LOADING: "Загрузка…",
  LOGIN_HINT: "Войдите, чтобы посмотреть товары продавца.",
  LOGIN_BUTTON: "Войти",
  FETCH_PROFILE_FALLBACK: "Не удалось загрузить профиль продавца",
  EMPTY: "У продавца пока нет товаров в каталоге.",
  /** @param {string} userName */
  TITLE_FOR: (userName) => `Товары ${userName}`,
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
  PAYMENT_HINT_POINTS:
    "Оплата только баллами. Списание сразу, продвижение включается автоматически.",
  REGION_BOOST_HINT:
    "Буст и Баннер поднимают карточку в регионе продажи. ТОП — абсолютный верх выдачи во всех регионах. Оформление карточки видно везде.",
  TIER_LABEL: "Уровень продвижения",
  /** @param {string} percent */
  TIER_RATE_HINT: (percent) => `${percent}% от цены товара`,
  /** @param {string} title @param {string} description */
  TIER_OPTION: (title, description) => `${title} — ${description}`,
  DURATION_LABEL: "Срок",
  /** @param {number} pricePoints */
  DURATION_PRICE_POINTS: (pricePoints) => `${pricePoints} б.`,
  /** @param {string} title @param {number} pricePoints */
  DURATION_OPTION_POINTS: (title, pricePoints) => `${title} — ${pricePoints} баллов`,
  SUMMARY_TIER: "Уровень",
  SUMMARY_DURATION: "Срок действия",
  TOTAL_LABEL: "К оплате",
  /** @param {number} pricePoints */
  TOTAL_POINTS: (pricePoints) => `${pricePoints} баллов`,
  TARIFF_DURATION: (durationHours) => `${durationHours} ч.`,
  INSUFFICIENT_POINTS: (required, balance) =>
    `Недостаточно баллов: нужно ${required}, у вас ${balance}.`,
  SUBMIT_POINTS: "Оплатить баллами",
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
