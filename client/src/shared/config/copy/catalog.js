// Автосгенерировано из appUiCopy.js: домен «catalog».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import { pluralizeRuBall } from "../../lib/pluralizeRuBall.js";

export const PRODUCT_SIMILAR_UI = {
  TAB: "Похожие",
  LOADING: "Загрузка похожих товаров…",
  EMPTY: "Нет похожих товаров в этой категории.",
  FETCH_FALLBACK: "Не удалось загрузить похожие товары",
};

export const PRODUCT_COMPARE_UI = {
  TAB: "Сравнение",
  TITLE: "Сравнение",
  SECTION_ARIA: "Сравнение с похожими товарами",
  LOADING: "Подбираем товары для сравнения…",
  EMPTY: "Нет данных для сравнения",
  FETCH_FALLBACK: "Не удалось загрузить сравнение",
  RETRY: "Повторить",
  DETAILS_TEASER_TITLE: "Сравнить товар",
  DETAILS_TEASER_SUBTITLE: "С похожими предложениями",
  DETAILS_TEASER_ARIA: "Открыть вкладку сравнения",
};

export const PRODUCT_SALE_UI = {
  DETAILS_TEASER_TITLE: "Распродажа",
  /** @param {number} count */
  DETAILS_TEASER_REMAINING: (count) => `Осталось ${count} шт.`,
  DETAILS_TEASER_GO: "Купить сейчас",
  DETAILS_TEASER_ARIA: "Открыть товары продавца",
};

/** Главная страница каталога */
export const HOME_PAGE_UI = {
  PRODUCT_CATEGORY_FILTER_LIST_ID: "home-product-category-filter-list",
  LOADING_CATALOG: "Загрузка каталога…",
  LOADING_SESSION: "Загрузка…",
  FETCH_PRODUCTS_FALLBACK: "Не удалось загрузить товары",
  FETCH_PROFILE_FALLBACK: "Не удалось загрузить профиль",
  FETCH_MY_PROFILE_FALLBACK: "Не удалось загрузить мой профиль",
  // TITLE_CATALOG: "Каталог товаров",
  TITLE_CATALOG: "Gitorg",
  LOGO_SRC: "/logo-gitorg.png",
  LOGO_ALT: "Gitorg",
  BREADCRUMB_HOME: "Главная",
  NAV_TO_HOME: "Главная",
  CATALOG_HOME_SECTION: "Главная",
  TITLE_USERS: "Пользователи",
  TITLE_CART: "Корзина",
  TITLE_MY_ORDERS: "Мои покупки",
  TITLE_MY_SALES: "Мои продажи",
  TITLE_ADMIN_ORDERS: "Все заказы",
  TITLE_PRODUCT_MODERATION: "На модерации",
  TITLE_INTRO_AD_MODERATION: "Intro-реклама",
  TITLE_SELLER_PERSONAL_CATEGORY_MODERATION: "Личные категории",
  TITLE_ADVERTISING: "Реклама в intro",
  TITLE_PRODUCT_REPORTS: "Жалобы",
  TITLE_DATA_CONFIRMATION: "Подтверждение данных",
  TITLE_INSTALLMENT_PAYMENTS: "Покупки - Рассрочка",
  TITLE_INSTALLMENT_SALES: "Продажи - Рассрочка",
  TITLE_INSTALLMENT_DISPUTES: "Споры по рассрочке",
  NAV_TO_CATALOG: "← Каталог товаров",
  NAV_AUTH_ARIA: "Действия аккаунта",
  NAV_MOBILE_BOTTOM_ARIA: "Основная навигация",
  NAV_MOBILE_HOME: "Дом",
  NAV_MOBILE_HOME_ARIA: "На главный экран",
  NAV_MOBILE_CATALOG: "Каталог",
  NAV_MOBILE_CREATE_PRODUCT: "Создать",
  NAV_MOBILE_CART: "Корзина",
  NAV_MOBILE_PROFILE: "Профиль",
  NAV_SECTIONS_ARIA: "Навигация по разделам",
  NAV_TO_USERS: "Пользователи",
  NAV_TO_SUBSCRIPTIONS: "Подписки",
  TITLE_SUBSCRIPTIONS: "Подписки",
  TITLE_WISHLIST: "Мои желания",
  NAV_TO_WISHLIST: "Мои желания",
  TITLE_NOTIFICATIONS: "Уведомления",
  FILTER_FOLLOWING_ONLY: "Только от подписок",
  FILTER_NEAR: "Рядом",
  FILTER_AUCTION_ONLY: "Только с аукционом",
  FILTER_INSTALLMENT_ONLY: "Только в рассрочку",
  CATALOG_FILTERS_PANEL_ARIA: "Фильтры каталога",
  CATEGORY_FILTER_LABEL: "Категория",
  CATALOG_FILTERS_SECTION_LABEL: "Фильтры",
  EMPTY_FOLLOWING_FILTER: "Нет товаров от ваших подписок с текущими фильтрами.",
  EMPTY_SALE_FILTER: "Нет товаров в распродаже от 35%.",
  EMPTY_RENTAL_FILTER: "Нет товаров в прокате и аренде.",
  EMPTY_AFFILIATE_FILTER: "Нет товаров с партнёрской программой.",
  EMPTY_WHOLESALE_FILTER: "Нет товаров с оптовой ценой.",
  EMPTY_ORIGINAL_FILTER: "Нет оригинальных товаров.",
  EMPTY_INSTALLMENT_FILTER: "Нет товаров с рассрочкой с текущими фильтрами.",
  EMPTY_NEAR_FILTER: "Нет товаров рядом с вашим адресом.",
  LOGIN_FOR_FOLLOWING_FILTER: "Войдите, чтобы включить фильтр «только от подписок».",
  NEAR_ADDRESS_REQUIRED: "Укажите адрес в профиле, чтобы смотреть товары рядом",
  NEAR_ADDRESS_REQUIRED_CONFIRM: "Открыть редактирование профиля?",
  NEAR_REGION_SECTION: "В вашем регионе",
  NAV_TO_CART: "Корзина",
  NAV_TO_MY_ORDERS: "Мои покупки",
  NAV_TO_ADMIN_ORDERS: "Все заказы",
  CATALOG_FILTER_BUTTON_ARIA: "Фильтры каталога",
  CATALOG_FILTER_BUTTON_ARIA_ACTIVE: "Фильтры каталога: выбраны параметры",
  CATALOG_MENU_BUTTON_ARIA: "Каталог категорий",
  BREADCRUMB_CATALOG: "Каталог",
  CATEGORY_ALL_BUTTON: "Все категории",
  FILTER_BUTTON_ARIA: "Фильтр по категории",
  FILTER_BUTTON_ARIA_SELECTED: (categoryLabel) =>
    `Фильтр по категории: ${categoryLabel}`,
  SORT_LABEL: "Сортировка",
  MODERATION_STATUS_FILTER_LABEL: "Статус",
  CATEGORY_ALL: "Все категории",
  EMPTY_MY_BY_MODERATION_STATUS: "Нет товаров с выбранным статусом.",
  MY_PRODUCTS_QUOTA_LABEL: "Товаров",
  LIST_PRODUCT_BUTTON: "Разместить товар",
  LOGIN_TO_LIST_PRODUCT: "Войти, чтобы разместить",
  AUTH_MY_PROFILE: "Мой профиль",
  AUTH_LOGIN: "Войти",
  AUTH_REGISTER: "Зарегистрироваться",
  EMPTY_MY_PRODUCTS: "У вас пока нет товаров в каталоге.",
  EMPTY_NO_PRODUCTS: "Товаров пока нет.",
  EMPTY_MY_FILTERED: "У вас нет товаров в каталоге с текущими фильтрами.",
  EMPTY_CATEGORY: "В выбранной категории товаров нет.",
  EMPTY_BY_QUERY: "По вашему запросу ничего не найдено.",
  CATALOG_LOAD_MORE_FAIL: "Не удалось подгрузить ещё товары",
  CATALOG_LOAD_MORE_RETRY: "Повторить",
  CATALOG_LOADING_MORE: "Подгружаем…",
  CATALOG_PRODUCTS_LIST_ARIA: "Список товаров каталога",
  CATALOG_PROMOTED_BANNERS_ARIA: "Продвигаемые товары баннером",
};

/** Сетка категорий `/catalog` */
export const PRODUCT_CATEGORY_DISPLAY_UI = {
  GRID_ARIA: "Категории товаров",
  FEED_GRID_ARIA: "Разделы каталога",
  FEED_SECTION_TITLE: "Подборки",
  CATEGORIES_SECTION_TITLE: "Категории",
  LOADING: "Загрузка категорий…",
  EDIT_TITLE: (label) => `Категория: ${label}`,
  EDIT_ARIA: (label) => `Редактировать категорию «${label}»`,
  CLOSE_ARIA: "Закрыть",
  LABEL_FIELD: "Название",
  LABEL_PLACEHOLDER: (defaultLabel) => defaultLabel,
  LABEL_HINT: "Пустое поле — стандартное название из списка.",
  IMAGE_FIELD: "Картинка",
  IMAGE_HINT: "JPEG, PNG или WebP. Пустое поле — стандартная иконка.",
  SAVE_BUTTON: "Сохранить",
  SAVING: "Сохранение…",
  SAVE_FALLBACK: "Не удалось сохранить категорию",
  RESET_BUTTON: "Сбросить к дефолту",
  FEED_EDIT_TITLE: (label) => `Подборка: ${label}`,
  FEED_EDIT_ARIA: (label) => `Редактировать подборку «${label}»`,
  FEED_LABEL_HINT: "Пустое поле — стандартное название из списка.",
  FEED_SAVE_FALLBACK: "Не удалось сохранить подборку",
  SUBCATEGORY_VIEW_ALL: "Посмотреть всё",
  SUBCATEGORY_PICKER_ARIA: "Подкатегории",
  SUBCATEGORY_BACK: "Назад",
  SUBCATEGORY_BACK_ARIA: "Назад к предыдущему уровню категорий",
  SUBCATEGORY_NODE_EDIT_ARIA: (label) => `Редактировать подкатегорию «${label}»`,
  SUBCATEGORY_NODE_EDIT_TITLE: (label) => `Подкатегория: ${label}`,
  SUBCATEGORY_NODE_LABEL_HINT: "Пустое поле — название из дерева категорий.",
};

/** Кнопка добавления товара в корзину */
export const ADD_TO_CART_UI = {
  ADD: "В корзину",
  OUT_OF_STOCK: "Нет в наличии",
  BLOCKED: "Вы заблокированы",
  SELLER_CLOSED: "У нас закрыто",
  SELLER_CLOSED_OVERLAY_FALLBACK: "Закрыто",
  GO_TO_CART: "Перейти в корзину",
  LOGIN_TO_ADD: "Войти, чтобы купить",
  DECREASE_ARIA: "Уменьшить количество",
  INCREASE_ARIA: "Увеличить количество",
  QUANTITY_ARIA: "Количество в корзине",
};

export const WISHLIST_TOGGLE_UI = {
  ADD_ARIA: "Добавить в желания",
  REMOVE_ARIA: "Убрать из желаний",
};

export const PRODUCT_WISHLIST_UI = {
  /** @param {number} count */
  PUBLIC_COUNT: (count) => `♥ ${count}`,
};

/** Превью продавца в модалке товара */
export const PRODUCT_SELLER_PREVIEW_UI = {
  SECTION_LABEL: "Продавец",
  OPEN_PROFILE_ARIA: "Открыть профиль продавца",
  LISTED_PRODUCTS_LABEL: "Товаров в продаже",
  PROFILE_CTA: "Смотреть профиль",
  PREMIUM_LABEL: "Премиум",
};

/** Карточка товара (заголовок по умолчанию) */
export const PRODUCT_CARD_UI = {
  DEFAULT_TITLE: "Товар",
  OPEN_DETAILS_ARIA: "Подробнее о товаре:",
  GALLERY_REGION_ARIA: "Галерея фото товара",
  /** @param {number} current @param {number} total */
  GALLERY_COUNTER_ARIA: (current, total) => `Фото ${current} из ${total}`,
  PREVIEW_FIELDS_ARIA: "Краткая информация о товаре",
  FOOTER_ACTIONS_ARIA: "Действия с товаром",
  STATUS_BADGES_ARIA: "Статусы товара",
  NO_STATUS_BADGE: "нет бейджа",
  /** @param {string} sellerName */
  SELLER_PROFILE_ARIA: (sellerName) => `Профиль продавца: ${sellerName}`,
  AVAILABILITY_STATUS_VISIBLE: "В каталоге для всех",
  AVAILABILITY_STATUS_HIDDEN: "Скрыт от покупателей",
  HIDE_FROM_CATALOG: "Скрыть от покупателей",
  SHOW_IN_CATALOG: "Показать в каталоге",
  AVAILABILITY_TOGGLE_PENDING: "Обновление…",
  MANAGE_PRODUCT_TOGGLE: "Редактировать",
  MANAGE_PRODUCT_COLLAPSE: "Свернуть",
  EDIT_PRODUCT: "Изменить",
  COPY_PRODUCT_ARIA: "Копировать товар",
  PROMOTION_BUTTON: "Управление",
  DELETE_PRODUCT: "Удалить товар",
  DELETE_PRODUCT_PENDING: "Удаление…",
  DELETE_CONFIRM_QUESTION: "Вы уверены, что хотите удалить этот товар?",
  DELETE_CONFIRM_YES: "Да, удалить",
  DELETE_CONFIRM_CANCEL: "Отмена",
  OPEN_SALES_LOCKED_HINT:
    "Скрыть или удалить можно, когда все покупки по товару подтверждены покупателями (или отменены).",
  HIDDEN_FROM_CATALOG_BADGE: "Скрыт от покупателей",
  OUT_OF_STOCK_OVERLAY: "Нет в наличии",
  OUT_OF_STOCK_OVERLAY_COMING_SOON: "Скоро поступление",
  SELLER_CLOSED_OVERLAY_FALLBACK: "Закрыто",
  OUT_OF_STOCK_TOGGLE_PENDING: "Сохраняем…",
  IMAGE_LIGHTBOX_OPEN_LABEL: "Показать изображение в полном размере",
  IMAGE_LIGHTBOX_CLOSE: "Закрыть просмотр изображения",
  IMAGE_LIGHTBOX_DIALOG_LABEL: "Изображение товара",
  IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY: "Фотографии товара",
  GALLERY_PREV: "Предыдущее фото",
  GALLERY_NEXT: "Следующее фото",
  PROMOTED_BADGE: "Буст",
  /** @param {string} tierLabel @param {string} until */
  PROMOTED_TIER_UNTIL: (tierLabel, until) =>
    `Продвижение «${tierLabel}» до ${until}`,
  PROMOTION_TOP_BADGE: "Топ",
  PROMOTION_BANNER_BADGE: "Баннер",
  RAFFLE_BADGE: "Розыгрыш",
  AFFILIATE_BADGE: (percent) => `Партнёрам ${percent}%`,
  AUCTION_BADGE: "Аукцион",
  LOYALTY_POINTS_TOOLTIP: "Даёт продавец; получает подтверждённый покупатель",
  /** @param {number} percent */
  DISCOUNT_BADGE: (percent) => `-${percent}%`,
  /** @param {number} percent */
  DISCOUNT_BADGE_DETAIL: (percent) => `-${percent}%`,
  /** @param {number} points */
  LOYALTY_POINTS_CONFIRMED: (points) => `+${points} ${pluralizeRuBall(points)}`,
  /** @param {number} points */
  LOYALTY_POINTS_UNCONFIRMED: (points) => `+${points} ${pluralizeRuBall(points)}`,
  /** @param {number} points */
  LOYALTY_POINTS_GUEST: (points) =>
    `+${points} ${pluralizeRuBall(points)}`,
  /** @param {number} points */
  LOYALTY_POINTS_DETAIL: (points) => `+${points} Б`,
  LOYALTY_POINTS_OVERCOMMITTED_BADGE: "Бонус выше доступного остатка баллов",
  RAFFLE_PARTICIPATION_ON: "Участвует в розыгрыше",
  RAFFLE_PARTICIPATION_OFF: "Добавить в розыгрыш",
  RAFFLE_PARTICIPATION_PENDING: "Сохраняем…",
  AUCTION_STATUS_ON: "Проводится аукцион (предложения цены)",
  AUCTION_STATUS_OFF: "Аукцион не проводится",
  AUCTION_TOGGLE_ON: "Проводить аукцион (предложения цены)",
  AUCTION_TOGGLE_OFF: "Выключить аукцион",
  AUCTION_TOGGLE_PENDING: "Обновление…",
  QA_TOGGLE_PENDING: "Обновление…",
  INSTALLMENT_BADGE: "Рассрочка",
  WHOLESALE_BADGE: "Опт",
  INSTALLMENT_SELL_BUTTON: "Продать в рассрочку",
};

/** Аренда (бейдж / feature-card деталей) */
export const PRODUCT_RENTAL_UI = {
  DETAILS_BADGE: "Аренда",
  DETAILS_TEASER_TITLE: "Аренда",
  /** @param {string} priceLabel */
  DETAILS_TEASER_PRICE_DAY: (priceLabel) => `${priceLabel} / сутки`,
  /** @param {string} priceLabel */
  DETAILS_TEASER_PRICE_HOUR: (priceLabel) => `${priceLabel} / час`,
  DETAILS_TEASER_ARIA: "Подробнее об аренде",
};

export const SITE_HEADER_BANNER_UI = {
  CAROUSEL_ARIA: "Баннеры на главной",
  AUTOPLAY_MS: 5000,
  AD_BADGE: "Реклама",
};

export const RAFFLE_FEATURED_CAROUSEL_UI = {
  SHOW: "Открыть розыгрыш",
  SECTION_ARIA: "Розыгрыши",
  AUTOPLAY_MS: 6000,
};

export const RAFFLE_FEATURED_BANNER_UI = {
  BADGE: "Розыгрыш",
  DETAILS_TEASER_TITLE: "Розыгрыш",
  DETAILS_TEASER_SUBTITLE: "Забери главный приз",
  DETAILS_TEASER_ARIA: "Открыть розыгрыш",
  /** @param {number} progress @param {number} target */
  PROGRESS: (progress, target) => `${progress} / ${target} продаж`,
  REMAINING: (left) => `Осталось ${left}`,
  STAT_GOAL: "Цель",
  STAT_SOLD: "Продано",
  STAT_PARTICIPANTS: "Участники",
  /** @param {number} sold @param {number} target */
  STAT_SOLD_VALUE: (sold, target) => `${sold} из ${target}`,
  COMPLETED: "Завершён",
  WINNER_TITLE: "Победитель розыгрыша",
  WINNER_FALLBACK_NAME: "Пользователь",
  WINNER_OPEN_PROFILE_ARIA: (userName) => `Открыть профиль ${userName}`,
  OPEN_PRODUCTS: "Товары розыгрыша",
  OPEN_INSTAGRAM: "Итоги в Instagram",
  CLOSE: "Закрыть",
};

export const RAFFLE_PRIZE_MEDIA_UI = {
  /** @param {boolean} muted */
  SOUND_TOGGLE_ARIA: (muted) =>
    muted ? "Включить звук видео розыгрыша" : "Выключить звук видео розыгрыша",
};

/** Компактная карточка в подборке на главной */
export const CURATED_PRODUCT_COMPACT_CARD_UI = {
  NO_IMAGE: "Нет фото",
  /** @param {string} [name] */
  OPEN_ARIA: (name) => `Открыть товар ${name ?? ""}`.trim(),
};
