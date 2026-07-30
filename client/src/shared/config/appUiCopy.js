/**
 * Статичные подписи интерфейса и числа, сгруппированные по темам (главная, профиль, API…).
 * Не хранит динамические ответы сервера — только дефолты и шаблоны.
 */

import { pluralizeRu } from "../lib/pluralizeRu.js";
import { pluralizeRuBall } from "../lib/pluralizeRuBall.js";

/** Общие символы и подписи */
export const COMMON_UI = {
  EM_DASH: "—",
  LOCALE_RU: "ru-RU",
  REQUIRED_FIELD_HINT: "Обязательно",
};

/** Поле URL изображения с загрузкой файла (`POST /upload`) */
export const IMAGE_URL_FIELD_UI = {
  UPLOAD_BUTTON: "Выбрать файл",
  UPLOAD_LOADING: "Загрузка…",
  UPLOAD_HINT: "JPEG, PNG или WebP, до 50 МБ — большие файлы сожмутся автоматически. Можно также вставить ссылку.",
  UPLOAD_DISABLED_HINT: "Загрузка файла доступна после входа в аккаунт",
  ERROR_TYPE: "Допустимы только JPEG, PNG и WebP",
  ERROR_SIZE: "Файл не больше 50 МБ",
  ERROR_GENERIC: "Не удалось загрузить файл",
  ERROR_AUTH: "Войдите в аккаунт, чтобы загрузить файл",
  FILE_INPUT_ARIA: "Выбрать изображение с устройства",
};

/** Квадратный кроп перед upload (аватар, как системный picker в приложении) */
export const SQUARE_IMAGE_CROP_UI = {
  TITLE: "Кадрирование аватара",
  HINT: "Перетащите фото и увеличьте масштаб, чтобы выбрать видимую область.",
  ZOOM: "Масштаб",
  CONFIRM: "Готово",
  CONFIRM_LOADING: "Обработка…",
  CANCEL: "Отмена",
  ERROR_GENERIC: "Не удалось обрезать изображение",
};

/** Загрузка intro-ролика: одна кнопка, сервер пережимает в MP4. */
export const INTRO_VIDEO_UPLOAD_UI = {
  PICK_BUTTON: "Выбрать видео",
  UPLOAD_LOADING: "Загружаем…",
  REPLACE_BUTTON: "Заменить",
  DURATION_HINT:
    "Максимум 10 секунд: более длинный ролик автоматически обрежется при загрузке. Исходный файл — до 100 МБ.",
  ERROR_TYPE: "Допустимы только MP4, WebM, MOV и HEVC",
  ERROR_GENERIC: "Не удалось загрузить видео",
  FILE_INPUT_ARIA: "Выбрать intro-видео с устройства",
};

/** Поле URL видео с загрузкой файла (`POST /upload/video`) */
export const VIDEO_URL_FIELD_UI = {
  UPLOAD_BUTTON: "Выбрать файл",
  UPLOAD_LOADING: "Загрузка…",
  UPLOAD_HINT:
    "MP4, WebM, MOV или HEVC (iPhone), до 25 МБ. Можно также вставить прямую ссылку.",
  ERROR_TYPE: "Допустимы только MP4, WebM, MOV и HEVC",
  ERROR_SIZE: "Файл не больше 25 МБ",
  ERROR_GENERIC: "Не удалось загрузить видео",
  ERROR_AUTH: "Войдите в аккаунт, чтобы загрузить файл",
  FILE_INPUT_ARIA: "Выбрать видео с устройства",
};

/** Превью-видео на карточке товара (до 3 с, loop в каталоге). */
export const PRODUCT_PREVIEW_VIDEO_UI = {
  LABEL: "Превью-видео (до 3 с, необязательно)",
  HINT: "MP4, WebM или MOV с iPhone — не длиннее 3 секунд. Сервер конвертирует в MP4 для всех браузеров. Нужно хотя бы одно фото товара.",
  CLEAR_BUTTON: "Убрать видео",
  ERROR_DURATION: "Видео не длиннее 3 секунд",
  ERROR_READ: "Не удалось прочитать видео",
  ERROR_REQUIRES_PHOTO:
    "Добавьте хотя бы одно фото — превью-видео не заменяет фотографии",
};

/** Да / нет в интерфейсе (карточка товара, профиль и т.д.) */
export const FORMAT_BOOLEAN_RU = {
  YES: "Да",
  NO: "Нет",
};

/** Сообщения по умолчанию для axios / парсинга ответа */
export const API_CLIENT_UI = {
  INVALID_SERVER_RESPONSE: "Неверный ответ сервера",
  LOGIN_FALLBACK: "Не удалось выполнить вход",
  REGISTER_FALLBACK: "Не удалось зарегистрироваться",
  FETCH_ME_FALLBACK: "Не удалось загрузить мой профиль",
  UPDATE_PROFILE_FALLBACK: "Не удалось сохранить профиль",
  FETCH_USER_PROFILE_FALLBACK: "Не удалось загрузить профиль",
  FETCH_USER_PURCHASES_FALLBACK: "Не удалось загрузить покупки",
  FETCH_USER_PRODUCTS_FALLBACK: "Не удалось загрузить товары",
  FETCH_USERS_SEARCH_FALLBACK: "Не удалось загрузить пользователей",
  FETCH_MONTHLY_LOYALTY_POINTS_FALLBACK:
    "Не удалось загрузить прогресс баллов за месяц",
  FETCH_MY_PRODUCTS_FALLBACK: "Не удалось загрузить ваши товары",
  FETCH_CATALOG_PRODUCT_FALLBACK: "Не удалось загрузить карточку товара",
  DELETE_MY_PRODUCT_FALLBACK: "Не удалось удалить товар",
  PATCH_MY_PRODUCT_FALLBACK: "Не удалось обновить товар",
  CREATE_PRODUCT_FALLBACK: "Не удалось создать товар",
  CREATE_PRODUCT_PENDING_HINT:
    "Товар отправлен на проверку. После одобрения модератором он появится в каталоге.",
  VOTE_SUBMIT_FALLBACK: "Не удалось отправить оценку",
  FETCH_MY_VOTE_FALLBACK: "Не удалось загрузить вашу оценку",
  CREATE_ORDER_FALLBACK: "Не удалось оформить заказ",
  FETCH_CART_FALLBACK: "Не удалось загрузить корзину",
  REPLACE_CART_FALLBACK: "Не удалось сохранить корзину",
  FETCH_WISHLIST_FALLBACK: "Не удалось загрузить список желаний",
  REPLACE_WISHLIST_FALLBACK: "Не удалось сохранить список желаний",
  FETCH_MY_ORDERS_FALLBACK: "Не удалось загрузить ваши покупки",
  FETCH_MY_SALES_FALLBACK: "Не удалось загрузить ваши продажи",
  RECORD_PRODUCT_VIEW_FALLBACK: "Не удалось записать просмотр товара",
  FETCH_ALL_ORDERS_FALLBACK: "Не удалось загрузить заказы",
  UPDATE_ORDER_STATUS_FALLBACK: "Не удалось обновить статус заказа",
  DELETE_USER_FALLBACK: "Не удалось удалить пользователя",
  FETCH_MODERATION_QUEUE_FALLBACK: "Не удалось загрузить очередь модерации",
  FETCH_MODERATION_COUNT_FALLBACK: "Не удалось загрузить счётчик модерации",
  APPROVE_PRODUCT_MODERATION_FALLBACK: "Не удалось одобрить товар",
  REJECT_PRODUCT_MODERATION_FALLBACK: "Не удалось отклонить товар",
  SUBMIT_PRODUCT_REPORT_FALLBACK: "Не удалось отправить жалобу",
  FETCH_PRODUCT_REPORT_STATUS_FALLBACK: "Не удалось проверить жалобу",
  FETCH_PRODUCT_REPORTS_FALLBACK: "Не удалось загрузить жалобы",
  FETCH_PRODUCT_REPORTS_COUNT_FALLBACK: "Не удалось загрузить счётчик жалоб",
  RESOLVE_PRODUCT_REPORTS_FALLBACK: "Не удалось обработать жалобы",
  MARK_NOTIFICATIONS_READ_FALLBACK: "Не удалось обновить уведомления",
  SUBMIT_DATA_CONFIRMATION_FALLBACK: "Не удалось отправить заявку",
  FETCH_DATA_CONFIRMATION_STATUS_FALLBACK: "Не удалось загрузить статус заявки",
  FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK: "Не удалось загрузить заявки",
  FETCH_DATA_CONFIRMATION_COUNT_FALLBACK: "Не удалось загрузить счётчик заявок",
  RESOLVE_DATA_CONFIRMATION_FALLBACK: "Не удалось рассмотреть заявку",
  FETCH_PREMIUM_STATUS_FALLBACK: "Не удалось загрузить статус премиума",
  PURCHASE_PREMIUM_FALLBACK: "Не удалось купить премиум",
  PREMIUM_PURCHASE_SUCCESS: "Премиум активирован",
  FETCH_LOYALTY_POINTS_STATUS_FALLBACK: "Не удалось загрузить раздел баллов",
  FETCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK:
    "Не удалось загрузить настройки розыгрыша среди пользователей",
  PATCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK:
    "Не удалось сохранить настройки розыгрыша среди пользователей",
  PURCHASE_LOYALTY_POINTS_FALLBACK: "Не удалось купить баллы",
  ADMIN_FREE_CREDIT_LOYALTY_POINTS_FALLBACK: "Не удалось начислить баллы",
  LOYALTY_POINTS_PURCHASE_SUCCESS: "Баллы зачислены",
  SUBMIT_PRICE_OFFER_FALLBACK: "Не удалось отправить предложение цены",
  FETCH_PRICE_OFFER_FALLBACK: "Не удалось загрузить предложение цены",
  FETCH_PRICE_OFFERS_TOP_FALLBACK: "Не удалось загрузить ставки",
  FETCH_SELLER_PRICE_OFFERS_FALLBACK: "Не удалось загрузить аукцион",
  FETCH_MY_PRICE_OFFER_BIDS_FALLBACK: "Не удалось загрузить ваши ставки",
  FETCH_INCOMING_PRICE_OFFERS_FALLBACK: "Не удалось загрузить входящие ставки",
  FETCH_INCOMING_PRICE_OFFERS_COUNT_FALLBACK: "Не удалось загрузить счётчик ставок",
  ACCEPT_PRICE_OFFER_FALLBACK: "Не удалось принять предложение",
  REJECT_PRICE_OFFER_FALLBACK: "Не удалось отклонить предложение",
  FOLLOW_USER_FALLBACK: "Не удалось подписаться",
  UNFOLLOW_USER_FALLBACK: "Не удалось отписаться",
  FETCH_MY_FOLLOWING_FALLBACK: "Не удалось загрузить подписки",
  FETCH_PRODUCT_REVIEW_SUMMARY_FALLBACK: "Не удалось загрузить отзывы",
  FETCH_PRODUCT_REVIEWS_FALLBACK: "Не удалось загрузить список отзывов",
  SUBMIT_PRODUCT_REVIEW_FALLBACK: "Не удалось опубликовать отзыв",
  PATCH_PRODUCT_REVIEW_FALLBACK: "Не удалось обновить отзыв",
  DELETE_PRODUCT_REVIEW_FALLBACK: "Не удалось удалить отзыв",
  FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK: "Не удалось загрузить пакеты продвижения",
  REQUEST_PRODUCT_PROMOTION_FALLBACK: "Не удалось отправить заявку на продвижение",
  FETCH_MY_PRODUCT_PROMOTIONS_FALLBACK: "Не удалось загрузить продвижения",
  FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK: "Не удалось загрузить очередь продвижения",
  FETCH_PRODUCT_PROMOTIONS_COUNT_FALLBACK: "Не удалось загрузить счётчик продвижения",
  APPROVE_PRODUCT_PROMOTION_FALLBACK: "Не удалось одобрить продвижение",
  REJECT_PRODUCT_PROMOTION_FALLBACK: "Не удалось отклонить продвижение",
  FETCH_FEATURED_RAFFLE_FALLBACK: "Не удалось загрузить розыгрыш",
  FETCH_RAFFLE_FALLBACK: "Не удалось загрузить розыгрыш",
  FETCH_RAFFLE_PRODUCTS_FALLBACK: "Не удалось загрузить товары розыгрыша",
  CREATE_RAFFLE_FALLBACK: "Не удалось создать розыгрыш",
  FETCH_MY_RAFFLE_FALLBACK: "Не удалось загрузить ваш розыгрыш",
  FETCH_RAFFLE_CREATE_ADVERTISING_FALLBACK: "Не удалось загрузить услугу «Розыгрыш»",
  UNLOCK_RAFFLE_CREATE_FALLBACK: "Не удалось оплатить создание розыгрыша",
  CANCEL_RAFFLE_CREATE_FALLBACK: "Не удалось отменить создание розыгрыша",
  PATCH_RAFFLE_FALLBACK: "Не удалось сохранить розыгрыш",
  DELETE_RAFFLE_FALLBACK: "Не удалось удалить розыгрыш",
  FETCH_CATEGORY_DISPLAYS_FALLBACK: "Не удалось загрузить категории",
  PATCH_CATEGORY_DISPLAY_FALLBACK: "Не удалось сохранить категорию",
  FETCH_CATALOG_FEED_DISPLAYS_FALLBACK: "Не удалось загрузить подборки",
  PATCH_CATALOG_FEED_DISPLAY_FALLBACK: "Не удалось сохранить подборку",
  FETCH_MANAGE_TOGGLE_DISPLAYS_FALLBACK: "Не удалось загрузить оформление кнопок",
  PATCH_MANAGE_TOGGLE_DISPLAY_FALLBACK: "Не удалось сохранить оформление кнопки",
  PAUSE_RAFFLE_FALLBACK: "Не удалось снять розыгрыш с витрины",
  SET_RAFFLE_PARTICIPATION_FALLBACK: "Не удалось обновить участие в розыгрыше",
  FETCH_RAFFLES_QUEUE_FALLBACK: "Не удалось загрузить очередь розыгрышей",
  FETCH_RAFFLES_COUNT_FALLBACK: "Не удалось загрузить счётчик розыгрышей",
  APPROVE_RAFFLE_FALLBACK: "Не удалось одобрить розыгрыш",
  REJECT_RAFFLE_FALLBACK: "Не удалось отклонить розыгрыш",
};

/** Отзывы на товар */
export const PRODUCT_REVIEW_UI = {
  TAB_REVIEWS: "Отзывы",
  /** @param {number} count */
  TAB_REVIEWS_WITH_COUNT: (count) => `Отзывы (${count})`,
  SECTION_TITLE: "Отзывы",
  RATING_LINE: "★ {rating} · {count}",
  NO_REVIEWS: "Отзывов пока нет",
  YOUR_REVIEW: "Ваш отзыв",
  LEAVE_REVIEW: "Оставить отзыв",
  LABEL_RATING: "Оценка",
  LABEL_TEXT: "Текст отзыва (необязательно)",
  TEXT_PLACEHOLDER: "Что понравилось или не понравилось — по желанию",
  /** @param {number} current @param {number} max */
  TEXT_CHARS_USED: (current, max) => `${current} / ${max}`,
  SUBMIT: "Опубликовать отзыв",
  SAVE: "Сохранить",
  EDIT: "Изменить",
  CANCEL_EDIT: "Отмена",
  DELETE: "Удалить отзыв",
  LOAD_MORE: "Показать ещё",
  LOADING: "Загрузка…",
  LOGIN_TO_REVIEW: "Войдите, чтобы оставить отзыв",
  CONFIRMED_DATA_REQUIRED:
    "Отзыв доступен только пользователям с подтверждёнными данными",
  NOT_DELIVERED: "Отзыв можно оставить после получения товара",
  STAR_ARIA: "Оценка {value} из 5",
  DELETE_CONFIRM: "Удалить отзыв?",
};

/** Предложения цены (аукцион) */
export const PRODUCT_PRICE_OFFER_UI = {
  SECTION_TOP_TITLE: "Топ ставок",
  SECTION_FORM_TITLE: "Ваша цена",
  TAB_DETAILS: "О товаре",
  TAB_AUCTION: "Аукцион",
  AUCTION_SHORTCUT: "В аукцион",
  DETAILS_TEASER_TITLE: "Аукцион",
  /** @param {string} priceLabel */
  DETAILS_TEASER_BEST_OFFER: (priceLabel) => `Топ ставка: ${priceLabel}`,
  DETAILS_TEASER_NO_OFFERS: "Топ ставка: ставок пока нет",
  DETAILS_TEASER_GO: "Предложить цену",
  DETAILS_TEASER_ARIA: "Открыть вкладку аукциона",
  LABEL_PRICE: "Ваша цена, ₽",
  INPUT_PLACEHOLDER: "Предложите свою цену",
  ERROR_PRICE_MAX: "Цена не может превышать 999 999 999 ₽",
  SUBMIT: "Предложить цену",
  UPDATE: "Изменить цену",
  CANCEL: "Отменить предложение",
  SUBMIT_LOADING: "Отправка…",
  STATUS_PENDING: "Ожидает решения продавца",
  STATUS_ACCEPTED: "Ставка принята — товар в корзине",
  STATUS_ORDERED: "Заказ по принятой цене оформлен",
  STATUS_REJECTED: "Отклонено",
  GO_TO_CART: "Перейти в корзину",
  CONFIRMED_DATA_REQUIRED: "Доступно только пользователям с подтверждёнными данными",
  CONFIRM_DATA_CTA: "Подтвердить данные",
  EMPTY_TOP: "Ставок пока нет",
  SELLER_EMPTY: "Предложений пока нет",
  SELLER_LOADING: "Загрузка…",
  AUCTION_NOT_HELD: "Аукцион не проводится",
  AUCTION_EMPTY: "Аукцион не проводится",
  AUCTION_ENDED: "Аукцион завершён",
  ARCHIVE_SECTION_TITLE: "История ставок",
  ARCHIVE_EMPTY: "Архив пуст",
  ACTION_ACCEPT: "Принять",
  ACTION_REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  ACCEPTED_BADGE: "Ожидает оплаты",
};

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
};

export const PRODUCT_SALE_UI = {
  DETAILS_TEASER_TITLE: "Распродажа",
  /** @param {number} count */
  DETAILS_TEASER_REMAINING: (count) => `Осталось ${count} шт.`,
  DETAILS_TEASER_GO: "Купить сейчас",
  DETAILS_TEASER_ARIA: "Открыть товары продавца",
};

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
  EXPAND_ALL: "Развернуть все",
  COLLAPSE_ALL: "Свернуть все",
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

/** Intro при первом заходе на сайт */
export const APP_INTRO_UI = {
  SKIP: "Пропустить",
  ENABLE_SOUND: "Включить звук",
  DISABLE_SOUND: "Выключить звук",
  FALLBACK_TITLE: "iziBuy",
  FALLBACK_HINT: "Добро пожаловать",
  REPLAY_LINK: "Посмотреть intro",
  ARIA_OVERLAY: "Заставка при открытии сайта",
  VIDEO_ARIA: "Intro-ролик",
  AD_BADGE: "Реклама",
  AD_CTA_SELLER_PRODUCTS: "Товары продавца",
  AD_CTA_PROFILE: "Профиль",
};

/** Подтверждение email */
export const EMAIL_VERIFICATION_UI = {
  MODAL_TITLE: "Подтвердите email",
  MODAL_ARIA: "Подтверждение email",
  MODAL_EMAIL_FALLBACK: "ваш email",
  MODAL_TEXT: (email) =>
    `Мы отправили 6-значный код на ${email}. Введите код ниже — без этого нельзя оформить заказ или рассрочку.`,
  LABEL_CODE: "Код из письма",
  CODE_PLACEHOLDER: "000000",
  CODE_REQUIRED: "Введите 6-значный код из письма",
  CONFIRM_BUTTON: "Подтвердить",
  CONFIRM_LOADING: "Проверка…",
  CONFIRM_ERROR: "Не удалось подтвердить email",
  MODAL_CLOSE: "Продолжить как гость",
  RESEND_BUTTON: "Отправить письмо повторно",
  RESEND_LOADING: "Отправка…",
  RESENT: "Письмо отправлено. Проверьте почту.",
  RESEND_ERROR: "Не удалось отправить письмо",
  VERIFIED_SUCCESS: "Email подтверждён",
  VERIFIED_ERROR: "Не удалось подтвердить email",
  DISMISS_NOTICE: "Закрыть уведомление",
};

/** Регион просмотра (главная / профиль) */
export const REGION_UI = {
  LABEL: "Регион",
  VIEWER_LABEL: "Регион",
  VIEWER_ARIA: "Регион просмотра каталога",
  PLACEHOLDER: "Выберите регион",
  SHEET_TITLE: "Регион",
  SHEET_CLOSE: "Закрыть",
  SEARCH_PLACEHOLDER: "Поиск региона…",
  SEARCH_EMPTY: "Ничего не найдено",
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
  TITLE_CATALOG: "iziBuy",
  LOGO_SRC: "/logo-izibuy.png",
  LOGO_ALT: "iziBuy",
  BREADCRUMB_HOME: "Главная",
  NAV_TO_HOME: "Главная",
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
  FILTER_AUCTION_ONLY: "Только с аукционом",
  FILTER_INSTALLMENT_ONLY: "Только в рассрочку",
  CATALOG_FILTERS_PANEL_ARIA: "Фильтры каталога",
  CATEGORY_FILTER_LABEL: "Категория",
  CATALOG_FILTERS_SECTION_LABEL: "Фильтры",
  EMPTY_FOLLOWING_FILTER: "Нет товаров от ваших подписок с текущими фильтрами.",
  EMPTY_SALE_FILTER: "Нет товаров в распродаже от 35%.",
  EMPTY_INSTALLMENT_FILTER: "Нет товаров с рассрочкой с текущими фильтрами.",
  LOGIN_FOR_FOLLOWING_FILTER: "Войдите, чтобы включить фильтр «только от подписок».",
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
  GO_TO_CART: "Перейти в корзину",
  LOGIN_TO_ADD: "Войти, чтобы купить",
  DECREASE_ARIA: "Уменьшить количество",
  INCREASE_ARIA: "Увеличить количество",
  QUANTITY_ARIA: "Количество в корзине",
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
  MENU_ITEM_PLACEHOLDER_ARIA: (index) => `Пункт ${index} (скоро)`,
};

/** Страница FAQ */
export const FAQ_UI = {
  TITLE: "Частые вопросы",
  UPDATED_PREFIX: "Обновлено:",
  CONTACT_PREFIX: "Не нашли ответ? Напишите:",
  /** @param {string} question */
  QUESTION_ARIA: (question) => `Вопрос: ${question}`,
};

/** Юридические документы */
export const LEGAL_UI = {
  PRIVACY_TITLE: "Политика конфиденциальности",
  PRIVACY_LINK: "Политика конфиденциальности",
  PRIVACY_TAB: "Конфиденциальность",
  TERMS_TITLE: "Пользовательское соглашение",
  TERMS_LINK: "Пользовательское соглашение",
  TERMS_TAB: "Соглашение",
  LISTING_TITLE: "Правила размещения товаров",
  LISTING_TAB: "Размещение",
  OFFER_TITLE: "Публичная оферта",
  OFFER_TAB: "Оферта",
  UPDATED_PREFIX: "Обновлено:",
  CONTACT_PREFIX: "Контакты:",
};

/** Страница «Корзина» */
export const CART_PAGE_UI = {
  TITLE: "Корзина",
  EMPTY: "Корзина пуста.",
  LOADING: "Загрузка корзины…",
  TOTAL_LABEL: "Итого",
  PAYABLE_LABEL: "К оплате",
  PRICE_LABEL: "Цена",
  DISCOUNT_LABEL: "Скидка",
  WHOLESALE_DISCOUNT_LABEL: "Оптовая скидка",
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
  SECTION_FULFILLMENT_HINT: "Оформляется отдельным заказом",
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
  SUGGEST_LOADING: "Ищем адреса…",
  SUGGEST_ERROR: "Подсказки недоступны",
};

/** Форма оформления заказа */
export const CHECKOUT_FORM_UI = {
  HEADING: "Оформление заказа",
  LABEL_FULFILLMENT: "Способ получения",
  FULFILLMENT_PICKUP: "Самовывоз",
  FULFILLMENT_DELIVERY: "Доставка",
  FULFILLMENT_DELIVERY_SOON: "Скоро",
  FULFILLMENT_DELIVERY_UNAVAILABLE: "недоступна для выбранных товаров",
  FULFILLMENT_PICKUP_UNAVAILABLE: "недоступен для выбранных товаров",
  PICKUP_ADDRESS_LABEL: "Адрес самовывоза",
  LABEL_DELIVERY_ADDRESS: "Адрес доставки",
  PLACEHOLDER_DELIVERY_ADDRESS: "Город, улица, дом",
  LABEL_FLAT: "Квартира / офис",
  PLACEHOLDER_FLAT: "Необязательно",
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
  FULFILLMENT_LEGEND: "Какие способы получения поддерживаете",
  FULFILLMENT_PICKUP: "Самовывоз",
  FULFILLMENT_DELIVERY: "Доставка продавцом",
  CARRIERS_LEGEND: "Службы доставки (скоро)",
  SOON_BADGE: " · скоро",
  METHODS_REQUIRED_HINT: "Можно выбрать несколько. Хотя бы один способ обязателен.",
  METHODS_BOTH_HINT:
    "Покупатель выберет самовывоз или доставку. Адрес ниже — точка самовывоза / отправления.",
  PICKUP_HINT: "Укажите адрес и отметьте точку на карте (или выберите из подсказок).",
  DELIVERY_CARRIERS_HINT:
    "Покупатель укажет адрес доставки. Службы СДЭК / Яндекс / Почта — позже; пока доставляете сами.",
  ADDRESS_LABEL: "Адрес самовывоза",
  ADDRESS_LABEL_WAREHOUSE: "Адрес точки отправления",
  MAP_ARIA: "Карта точки самовывоза",
  MAP_KEY_MISSING:
    "Карта появится после добавления VITE_YANDEX_MAPS_API_KEY. Пока укажите адрес текстом или из подсказки.",
  DETAILS_TITLE: "Самовывоз",
  DETAILS_ROUTE: "Маршрут",
  DETAILS_OPEN_MAP: "Открыть на карте",
  DETAILS_NO_ADDRESS: "Адрес самовывоза не указан",
};

/** Подписи карточки заказа (используется на Мои покупки и Все заказы) */
export const ORDER_CARD_UI = {
  ITEMS_HEADING: "Позиции",
  DETAILS_FOLD_SUMMARY: "Подробности заказа",
  TOTAL_LABEL: "Итого",
  ADDRESS_LABEL: "Адрес доставки",
  TRACKING_LABEL: "Трек-номер",
  PAYMENT_LABEL: "Оплата",
  STATUS_LABEL: "Статус",
  ITEM_STATUS_LABEL: "Статус позиции",
  ITEM_DELIVERED_AT_LABEL: "Доставлен",
  ITEM_CONFIRMED_AT_LABEL: "Подтверждён",
  CREATED_LABEL: "Создан",
  BUYER_LABEL: "Покупатель",
  SELLER_LABEL: "Продавец",
  ACTION_SHIPPED: "Принять",
  ACTION_DELIVERED: "Доставлен",
  ACTION_CONFIRM: "Подтвердить",
  ACTION_CANCEL: "Отменить",
  ACTION_PENDING: "Сохраняем…",
  CANCEL_CONFIRM: "Отменить заказ покупателя?",
  BUYER_CANCEL_CONFIRM: "Отменить заказ?",
  DELETED_PRODUCT_NAME: "Товар удалён",
  /** @param {number} points */
  LOYALTY_POINTS_LINE: (points) => `+${points} баллов за шт. (подтверждённому покупателю)`,
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
  EXPAND_ALL: "Развернуть все",
  COLLAPSE_ALL: "Свернуть все",
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

/** Очередь intro-рекламы (moderator) */
export const INTRO_AD_MODERATION_PAGE_UI = {
  TITLE: "Intro-реклама",
  LOADING: "Загрузка очереди…",
  EMPTY: "Нет заявок на intro-рекламу.",
  EMPTY_BY_FILTER: "По выбранному фильтру заявок нет.",
  INTRO_PENDING_TITLE: "Intro-ролик — на модерации",
  INTRO_MANAGED_TITLE: "Intro-ролик — активные и в очереди",
  /** @param {number} count */
  PENDING_BADGE: (count) => (count > 99 ? "99+" : String(count)),
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
  /** @param {number} count */
  COUNT_ITEMS: (count) => `${count} заявок`,
  SECTION_FILTER_LABEL: "Раздел",
  SECTION_FILTER_ALL: "Все",
  SECTION_FILTER_INTRO: "Intro",
  SECTION_FILTER_BANNER: "Баннер",
  SECTION_FILTER_PERSONAL: "Личные",
  SECTION_FILTER_RAFFLE: "Розыгрыш",
  SECTION_FILTER_USERS_RAFFLE: "Среди пользователей",
  OVERVIEW_PENDING: "На модерации",
  OVERVIEW_INTRO: "Intro",
  OVERVIEW_BANNER: "Баннер",
  OVERVIEW_RAFFLE: "Розыгрыш",
  OVERVIEW_USERS_RAFFLE: "Среди пользователей",
  OVERVIEW_ATTENTION: "Нужно действие",
  EXPAND_ALL: "Развернуть все",
  COLLAPSE_ALL: "Свернуть все",
  REFRESH: "Обновить",
  ATTENTION_FILTER_HINT: "Показаны заявки, которые давно ждут или без обязательного медиа",
  COLLAPSED_STALE: "Давно в очереди",
  COLLAPSED_MISSING_MEDIA: "Нет медиа",
  /** @param {boolean} expanded */
  EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  REJECT_REASON_LABEL: "Причина отклонения (необязательно)",
  REJECT_REASON_PLACEHOLDER: "Комментарий для рекламодателя…",
  ACTION_PENDING: "Сохраняем…",
  ADVERTISER_LABEL: "Рекламодатель",
  SUBMITTED_LABEL: "Отправлено",
  PREVIEW: "Предпросмотр",
  FETCH_FALLBACK: "Не удалось загрузить очередь intro-рекламы",
  APPROVE_SUCCESS: "Заявка одобрена",
  APPROVE_FALLBACK: "Не удалось одобрить заявку",
  REJECT_SUCCESS: "Заявка отклонена",
  REJECT_FALLBACK: "Не удалось отклонить заявку",
  PENDING_TITLE: "На модерации",
  MANAGED_TITLE: "Активные и в очереди",
  STATUS_LABEL: "Статус",
  STATUS_ACTIVE: "Показ активен",
  STATUS_QUEUED: "В очереди",
  STAFF_CANCEL: "Снять кампанию",
  STAFF_CANCEL_SUCCESS: "Кампания снята",
  STAFF_CANCEL_FALLBACK: "Не удалось снять кампанию",
  MANAGED_FETCH_FALLBACK: "Не удалось загрузить активные кампании",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Раздел «Реклама в intro» */
export const ADVERTISING_PAGE_UI = {
  PAGE_TITLE: "Реклама",
  PAGE_LEAD:
    "Продвигайте магазин через intro-ролик, баннер в шапке, личную плитку в каталоге и розыгрыш. Оплата баллами лояльности.",
  HERO_CAPTION: "Реклама · баланс",
  /** @param {number} balance */
  BALANCE: (balance) => `${balance} баллов`,
  BALANCE_LABEL: "Баланс",
};

export const INTRO_AD_PAGE_UI = {
  CARD_TITLE: "Intro-ролик",
  TEMPORARILY_UNAVAILABLE: "Временно не работает",
  PAGE_ARIA: "Реклама в intro",
  LOGIN_HINT: "Войдите, чтобы оформить рекламу в intro.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить раздел рекламы",
  SUBMIT_FALLBACK: "Не удалось отправить заявку",
  SUBMIT_SUCCESS: "Заявка отправлена на модерацию",
  CANCEL_FALLBACK: "Не удалось отменить заявку",
  CANCEL_SUCCESS: "Заявка отменена",
  /** @param {number} price */
  PRICE: (price) => `Стоимость: ${price} баллов`,
  DURATION: "Срок показа: 3 дня",
  DESCRIPTION:
    "Ваш intro-ролик заменит заставку сайта для новых посетителей и при просмотре intro. После модерации баллы списываются, показ ставится в очередь, если слот занят.",
  /** @param {number} balance */
  BALANCE: (balance) => `Доступно: ${balance} баллов`,
  STATUS_PENDING: "На модерации. Баллы зарезервированы.",
  STATUS_QUEUED: "Одобрено. Ожидает свободного слота.",
  STATUS_ACTIVE: "Показ активен.",
  SUBMIT: "Отправить на модерацию",
  CANCEL: "Отменить заявку",
  PREVIEW: "Предпросмотр",
  OPEN_FORM: "Оформить рекламу",
  SECTION_TIMING: "Тайминги показа",
  LABEL_MIN_MS: "Минимум показа, мс",
  LABEL_MAX_MS: "Максимум показа, мс",
  LABEL_FADE_MS: "Fade-out, мс",
  TIMING_HINT: "Необязательно — по умолчанию как у платформенного intro.",
};

/** Покупка баннера в шапке (вкладка «Реклама») */
export const SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI = {
  CARD_TITLE: "Баннер в шапке",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить раздел баннера",
  SUBMIT_FALLBACK: "Не удалось отправить заявку",
  SUBMIT_SUCCESS: "Заявка отправлена на модерацию. Баллы зарезервированы.",
  CANCEL_FALLBACK: "Не удалось отменить заявку",
  CANCEL_SUCCESS: "Заявка отменена. Баллы возвращены.",
  DESCRIPTION:
    "Ваш баннер появится в карусели под шапкой на главной после модерации. Показ длится 7 дней. Одновременно доступно до 200 платных слотов.",
  STATUS_PENDING: "На модерации. Баллы зарезервированы.",
  STATUS_ACTIVE: "Показ активен.",
  SUBMIT: "Отправить на модерацию",
  CANCEL: "Отменить заявку",
  PREVIEW: "Предпросмотр",
  OPEN_FORM: "Оформить баннер",
  LABEL_REGION: "Регион показа",
  HINT_REGION: "Баннер увидят покупатели только этого региона.",
  ERROR_REGION_REQUIRED: "Выберите регион показа",
};

/** Создание розыгрыша (вкладка «Реклама») */
export const RAFFLE_ADVERTISING_PAGE_UI = {
  CARD_TITLE: "Розыгрыш",
  CARD_BADGE: "цель",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить услугу «Розыгрыш»",
  UNLOCK_FALLBACK: "Не удалось оплатить создание розыгрыша",
  UNLOCK_SUCCESS: "Баллы зарезервированы. Заполните розыгрыш.",
  DESCRIPTION:
    "Создайте розыгрыш для своих товаров. После оплаты 3000 баллов откроется форма заявки. После модерации розыгрыш появится на витрине (до 200 активных одновременно). При отклонении баллы возвращаются.",
  /** @param {number} price */
  PRICE: (price) => `${price} баллов`,
  COST_LABEL: "Стоимость",
  MODERATION_LABEL: "Модерация",
  MODERATION_VALUE: "Обязательна",
  STATUS_PENDING: "На модерации.",
  STATUS_ACTIVE: "Розыгрыш активен.",
  STATUS_PAUSED: "Розыгрыш на паузе.",
  PAY_AND_CREATE: "Оплатить 3000 баллов",
  /** @param {number} price */
  PAY_AND_CREATE_WITH_PRICE: (price) => `Оплатить ${price} баллов`,
  CONTINUE_CREATE: "Заполнить розыгрыш",
  INSUFFICIENT_POINTS: "Недостаточно баллов для оплаты.",
  DATA_CONFIRMATION_REQUIRED: "Подтвердите данные профиля, чтобы создать розыгрыш.",
};

/** Модерация баннера в шапке (вкладка intro-ad-moderation) */
export const SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI = {
  PENDING_TITLE: "Баннер в шапке — на модерации",
  MANAGED_TITLE: "Баннер в шапке — активные",
  EMPTY: "Нет заявок на баннер в шапке.",
  ADVERTISER_LABEL: "Рекламодатель",
  SUBMITTED_LABEL: "Отправлено",
  STATUS_LABEL: "Статус",
  STATUS_ACTIVE: "Показ активен",
  PREVIEW: "Предпросмотр",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  STAFF_CANCEL: "Снять баннер",
  REJECT_REASON_LABEL: "Причина отклонения (необязательно)",
  REJECT_REASON_PLACEHOLDER: "Комментарий для рекламодателя…",
  FETCH_FALLBACK: "Не удалось загрузить очередь баннеров",
  MANAGED_FETCH_FALLBACK: "Не удалось загрузить активные баннеры",
  APPROVE_SUCCESS: "Заявка одобрена",
  APPROVE_FALLBACK: "Не удалось одобрить заявку",
  REJECT_SUCCESS: "Заявка отклонена",
  REJECT_FALLBACK: "Не удалось отклонить заявку",
  STAFF_CANCEL_SUCCESS: "Баннер снят",
  STAFF_CANCEL_FALLBACK: "Не удалось снять баннер",
};

/** Личная категория продавца (вкладка «Реклама») */
export const SELLER_PERSONAL_CATEGORY_PAGE_UI = {
  SECTION_TITLE: "Личная категория",
  SECTION_LEAD:
    "Отдельная плитка в каталоге с вашим названием и картинкой. Все одобренные товары попадают и в глобальную категорию, и в личную. После модерации баллы списываются. Одновременно на сайте до 200 активных личных категорий.",
  TILES_SECTION_TITLE: "Личные категории продавцов",
  TILES_LOADING: "Загрузка личных категорий…",
  FETCH_TILES_FALLBACK: "Не удалось загрузить личные категории",
  FETCH_FALLBACK: "Не удалось загрузить заявку на личную категорию",
  SUBMIT_FALLBACK: "Не удалось отправить заявку",
  SUBMIT_SUCCESS: "Заявка на личную категорию отправлена на модерацию",
  CANCEL_FALLBACK: "Не удалось отменить заявку",
  CANCEL_SUCCESS: "Заявка отменена",
  OPEN_FORM: "Купить личную категорию",
  SUBMIT: "Отправить на модерацию",
  CANCEL: "Отменить заявку",
  LABEL_NAME: "Название категории",
  LABEL_IMAGE: "Картинка плитки",
  LABEL_REGION: "Регион показа",
  HINT_REGION: "Плитка появится в каталоге только у покупателей этого региона.",
  ERROR_REGION_REQUIRED: "Выберите регион показа",
  LABEL_DURATION: "Срок",
  /** @param {number} balance */
  BALANCE: (balance) => `Доступно: ${balance} баллов`,
  /** @param {number} price */
  PRICE: (price) => `Стоимость: ${price} баллов`,
  STATUS_PENDING: "На модерации. Баллы зарезервированы.",
  STATUS_ACTIVE: "Личная категория активна в каталоге.",
  LOADING: "Загрузка…",
  /** @param {string | Date | null | undefined} activeUntil */
  STATUS_ACTIVE_UNTIL: (activeUntil) => {
    if (!activeUntil) {
      return "";
    }
    const dateLabel = new Date(activeUntil).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Активна до ${dateLabel}`;
  },
};

/** Очередь личных категорий (moderator) */
export const SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI = {
  TITLE: "Личные категории",
  PENDING_TITLE: "Личные категории — на модерации",
  EMPTY: "Нет заявок на личные категории.",
  SELLER_LABEL: "Продавец",
  REJECT_REASON_PLACEHOLDER: "Комментарий для продавца…",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  MANAGED_TITLE: "Личные категории — опубликованы",
  STATUS_ACTIVE: "Активна",
  STAFF_UNPUBLISH: "Снять с публикации",
  STAFF_DELETE: "Удалить",
  STAFF_UNPUBLISH_FALLBACK: "Не удалось снять категорию",
  STAFF_DELETE_FALLBACK: "Не удалось удалить категорию",
  MANAGED_FETCH_FALLBACK: "Не удалось загрузить опубликованные категории",
  FETCH_FALLBACK: "Не удалось загрузить очередь личных категорий",
  APPROVE_FALLBACK: "Не удалось одобрить заявку",
  REJECT_FALLBACK: "Не удалось отклонить заявку",
};

/** Очередь модерации товаров (admin / moderator) */
export const PRODUCT_MODERATION_PAGE_UI = {
  TITLE: "На модерации",
  LOADING: "Загрузка очереди…",
  EMPTY: "Нет товаров, ожидающих проверки.",
  BADGE_PENDING: "На проверке",
  BADGE_APPROVED: "Одобрен",
  BADGE_REJECTED: "Отклонён",
  REJECT_COMMENT_LABEL: "Комментарий для продавца (необязательно)",
  REJECT_COMMENT_PLACEHOLDER: "Причина отклонения…",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  SELLER_LABEL: "Продавец",
  CREATED_LABEL: "Создан",
  REJECTION_COMMENT_PREFIX: "Комментарий модератора:",
  PRODUCTS_LIST_ARIA: "Очередь товаров на модерации",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Жалобы на товары (staff) */
export const PRODUCT_REPORTS_PAGE_UI = {
  TITLE: "Жалобы",
  /** @param {number} count */
  COUNT: (count) => `${count} групп`,
  SECTION_FILTER_LABEL: "Раздел",
  SECTION_FILTER_ALL: "Все",
  LOADING: "Загрузка жалоб…",
  EMPTY: "Нет необработанных жалоб.",
  EMPTY_BY_FILTER: "В выбранном разделе жалоб нет.",
  SECTION_PRODUCTS: "Товары",
  SECTION_STORIES: "Сторисы",
  REPORTS_COUNT_LABEL: (count) => `Жалоб: ${count}`,
  REPORT_ITEM_META: (userName, dateText) => `${userName} · ${dateText}`,
  STAFF_NOTE_LABEL: "Комментарий staff",
  STAFF_NOTE_PLACEHOLDER: "Обязательный комментарий…",
  ACTION_DISMISS: "Отклонить жалобы",
  ACTION_HIDE: "Скрыть товар",
  ACTION_REJECT: "Отклонить товар",
  ACTION_PENDING: "Сохраняем…",
  OPEN_PRODUCT: "Открыть товар",
  OPEN_SELLER: "Продавец",
  OPEN_REPORTER: "Жалобщик",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Сторисы пользователей на главной */
export const USER_STORY_UI = {
  SECTION_TITLE: "История",
  ADD_LABEL: "Ваша история",
  LOADING: "Загрузка…",
  MEDIA_LOADING: "Загружаем медиа…",
  MEDIA_LOAD_ERROR: "Не удалось загрузить фото или видео",
  CREATE_TITLE: "Новый сторис",
  CAPTION_LABEL: "Текст (необязательно)",
  CAPTION_PLACEHOLDER: "До 150 символов…",
  PICK_PHOTO: "Фото",
  PICK_VIDEO: "Видео",
  PUBLISH: "Опубликовать",
  PUBLISHING: "Публикуем…",
  DELETE: "Удалить",
  DELETING: "Удаляем…",
  REPORT: "Пожаловаться",
  CLOSE: "Закрыть",
  ERROR_GENERIC: "Не удалось выполнить действие",
  ERROR_VIDEO_TYPE: "Видео: только MP4 или WebM",
  ERROR_VIDEO_SIZE: "Видео: не больше 100 МБ",
  ERROR_VIDEO_ASPECT: "Видео: только вертикальный формат 9:16",
  ERROR_VIDEO_READ: "Не удалось прочитать видео",
  VIDEO_DURATION_HINT:
    "Максимум 30 секунд: более длинный ролик автоматически обрежется при загрузке. Исходный файл — до 100 МБ.",
  ERROR_IMAGE: "Не удалось обработать фото",
  ERROR_CAPTION: "Текст: не больше 150 символов",
  ERROR_MEDIA_REQUIRED: "Выберите фото или видео",
  STORY_REPORT_TITLE: "Жалоба на сторис",
  STORY_REPORT_SUBMIT: "Отправить жалобу",
  STORY_REPORT_PENDING: "Отправляем…",
  STORY_REPORT_TEXT_LABEL: "Опишите проблему",
  STORY_REPORT_TEXT_PLACEHOLDER: "Текст жалобы…",
  STORY_REPORTS_COUNT_LABEL: (count) => `Жалоб: ${count}`,
  STORY_REPORTS_OPEN_AUTHOR: "Автор",
  STORY_REPORTS_ACTION_DISMISS: "Отклонить жалобы",
  STORY_REPORTS_ACTION_HIDE: "Скрыть сторис",
  STORY_REPORTS_STAFF_NOTE_LABEL: "Комментарий staff",
  STORY_REPORTS_STAFF_NOTE_PLACEHOLDER: "Обязательный комментарий…",
  STORY_REPORTS_ACTION_PENDING: "Сохраняем…",
  PREV_STORY: "Предыдущий",
  NEXT_STORY: "Следующий",
};

/** Заявки на подтверждение данных (staff) */
export const DATA_CONFIRMATION_PAGE_UI = {
  LOADING: "Загрузка заявок…",
  EMPTY: "Нет заявок на рассмотрении.",
  SUBMITTED_LABEL: "Подана",
  OPEN_APPLICANT: "Профиль заявителя",
  PASSPORT_SECTION: "Паспортные данные",
  PASSPORT_SELFIE_SECTION: "Фото с паспортом в руках",
  PASSPORT_SELFIE_MISSING: "Фото не приложено",
  PASSPORT_SELFIE_LOAD_ERROR: "Не удалось загрузить фото",
  PASSPORT_SELFIE_OPEN: "Открыть фото в полном размере",
  STAFF_NOTE_LABEL: "Комментарий при отклонении",
  STAFF_NOTE_PLACEHOLDER: "Не меньше 3 слов…",
  STAFF_NOTE_MIN_WORDS: 3,
  ACTION_APPROVE: "Подтвердить",
  ACTION_REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Раздел «Подтверждение данных» в профиле */
export const USER_DATA_CONFIRMATION_PROFILE_PAGE_UI = {
  PAGE_ARIA: "Подтверждение данных",
  LOGIN_HINT: "Войдите, чтобы подать заявку на подтверждение.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить статус",
  PLAN_TITLE: "Подтверждение данных",
  PLAN_INTRO:
    "После проверки паспорта модератором появится значок подтверждённого аккаунта.",
  BENEFITS_TITLE: "Что даёт подтверждение",
  PLAN_BENEFITS: [
    "Отзывы на товары после подтверждённой покупки",
    "Ставки на аукционе (предложение цены)",
    "Покупка и продажа в рассрочку",
    "Создание розыгрыша (для продавца)",
    "Товары в фильтре «Подтверждённые продавцы»",
    "Бейдж подтверждения у имени в каталоге",
    "Баллы лояльности за покупки",
  ],
  PLAN_NOTE:
    "Не заменяет премиум: 30 товаров, золотая обводка и сторис — отдельно.",
  STATUS_CONFIRMED: "Данные уже подтверждены.",
  STATUS_PENDING: "Заявка на рассмотрении. Дождитесь решения модератора.",
  /** @param {string} note */
  STATUS_REJECTED: (note) =>
    note ? `Заявка отклонена: ${note}` : "Заявка отклонена. Можно отправить новую.",
  OPEN_REQUEST: "Подать заявку",
};

/** Подача заявки на подтверждение данных */
export const DATA_CONFIRMATION_MODAL_UI = {
  ARIA_DIALOG: "Подтверждение данных",
  TITLE: "Подтверждение данных",
  INTRO:
    "Заполните паспортные данные и приложите фото с паспортом в руках. После проверки модератором у вас появится значок подтверждённого продавца.",
  STEP_PROGRESS: (current, total) => `Шаг ${current} из ${total}`,
  STEP_IDENTITY: "ФИО и дата рождения",
  STEP_PASSPORT: "Паспортные данные",
  STEP_SELFIE: "Фото с паспортом",
  NEXT: "Далее",
  BACK: "Назад",
  LABEL_PASSPORT_SELFIE: "Ваше фото с паспортом в руках",
  HINT_PASSPORT_SELFIE: "JPEG, PNG или WebP, до 50 МБ",
  ERROR_PASSPORT_SELFIE_REQUIRED: "Приложите фото с паспортом в руках",
  ERROR_PASSPORT_SELFIE_UPLOAD: "Не удалось загрузить фото",
  STATUS_PENDING: "Заявка на рассмотрении",
  STATUS_CONFIRMED: "Данные подтверждены",
  STATUS_REJECTED_TITLE: "Заявка отклонена",
  LABEL_LAST_NAME: "Фамилия",
  LABEL_FIRST_NAME: "Имя",
  LABEL_MIDDLE_NAME: "Отчество",
  LABEL_BIRTH_DATE: "Дата рождения",
  LABEL_SERIES: "Серия",
  LABEL_NUMBER: "Номер",
  LABEL_ISSUED_BY: "Кем выдан",
  LABEL_ISSUED_AT: "Дата выдачи",
  LABEL_DEPARTMENT_CODE: "Код подразделения",
  PLACEHOLDER_DEPARTMENT_CODE: "000-000",
  PLACEHOLDER_DATE: "ДД.ММ.ГГГГ",
  SUBMIT: "Отправить заявку",
  SUBMIT_LOADING: "Отправка…",
  CANCEL: "Отмена",
  OPEN_BUTTON: "Подтверждение данных",
  SUCCESS: "Заявка принята",
};

/** Подача жалобы на товар */
export const PRODUCT_REPORT_MODAL_UI = {
  ARIA_DIALOG: "Жалоба на товар",
  TITLE: "Пожаловаться на товар",
  LABEL_TEXT: "Опишите причину",
  PLACEHOLDER: "Текст жалобы…",
  SUBMIT: "Отправить",
  SUBMIT_LOADING: "Отправка…",
  CANCEL: "Отмена",
  ALREADY_REPORTED: "Жалоба уже отправлена",
  SUCCESS: "Жалоба принята",
  REPORT_BUTTON: "Пожаловаться",
  CHARS_USED: (current, max) => `${current} / ${max} символов`,
};

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

export const HEADER_NOTIFICATIONS_BUTTON_UI = {
  ARIA: "Уведомления",
  COUNT_ARIA: "Непрочитанных уведомлений",
  /** @param {number} n */
  BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

export const USER_FOLLOW_BUTTON_UI = {
  FOLLOW: "Подписаться",
  UNFOLLOW: "Отписаться",
  LOADING: "…",
  ERROR: "Не удалось изменить подписку",
};

export const HEADER_WISHLIST_BUTTON_UI = {
  ARIA: "Мои желания",
  COUNT_ARIA: "Товаров в списке желаний",
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

export const WISHLIST_TOGGLE_UI = {
  ADD_ARIA: "Добавить в желания",
  REMOVE_ARIA: "Убрать из желаний",
};

export const PRODUCT_WISHLIST_UI = {
  /** @param {number} count */
  PUBLIC_COUNT: (count) => `♥ ${count}`,
};

export const SUBSCRIPTIONS_PAGE_UI = {
  LOADING: "Загрузка подписок…",
  EMPTY: "Вы ни на кого не подписаны. Найдите продавцов в разделе «Пользователи».",
  FETCH_FALLBACK: "Не удалось загрузить подписки",
  LOGIN_HINT: "Войдите, чтобы видеть список подписок.",
  LOGIN_BUTTON: "Войти",
  HERO_CAPTION: "Подписки",
  /** @type {readonly [string, string, string]} */
  HERO_UNIT_FORMS: ["продавец", "продавца", "продавцов"],
  HERO_INFO: "Продавцы, за которыми вы следите. Их товары — в фильтре «Подписки» на главной.",
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
  EXPAND_ALL: "Развернуть все",
  COLLAPSE_ALL: "Свернуть все",
  REFRESH: "Обновить",
  ATTENTION_FILTER_HINT: "Показаны продажи, где нужно отметить отправку или доставку",
  COLLAPSED_SHIP: "Отметьте отправку",
  COLLAPSED_DELIVER: "Отметьте доставку",
  /** @param {boolean} expanded */
  EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
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

/** Экран списка пользователей */
export const USERS_PAGE_UI = {
  LOADING: "Загрузка пользователей…",
  EMPTY: "Пользователей пока нет.",
  EMPTY_BY_QUERY: "Никого не нашли по этому запросу.",
  SEARCH_TOO_SHORT: "Введите не менее 3 символов для поиска.",
};

/** Подиум лидеров на странице пользователей */
export const USERS_PODIUM_UI = {
  TITLE: "Лидеры",
  PLACE_1: "1 место",
  PLACE_2: "2 место",
  PLACE_3: "3 место",
};

/** Прогресс-бар месячных баллов на странице пользователей */
export const USERS_MONTHLY_LOYALTY_LOADBAR_UI = {
  TITLE: "Баллы необходимые достигнуть",
  /** @param {string} pointsLabel @param {string} goalLabel */
  PROGRESS_ARIA: (pointsLabel, goalLabel) =>
    `Начислено покупателям ${pointsLabel} из ${goalLabel} баллов за месяц`,
  /** @param {string} pointsLabel @param {string} goalLabel */
  COUNTER: (pointsLabel, goalLabel) => `${pointsLabel} / ${goalLabel}`,
};

/** Админ: редактирование чужого профиля */
export const ADMIN_EDIT_USER_UI = {
  TITLE: "Редактирование пользователя",
  SECTION_ADMIN: "Администрирование",
  LABEL_ROLE: "Роль",
  LABEL_DISCOUNT: "Скидка, %",
  LABEL_LOYALTY_POINTS: "Баллы лояльности",
  LABEL_PREMIUM: "Премиум",
  PREMIUM_CARD_TITLE: "Премиум",
  PREMIUM_TOGGLE_LABEL: "Премиум включён",
  /** @param {string} dateText */
  PREMIUM_STATUS_ACTIVE: (dateText) => `Активен до ${dateText}`,
  PREMIUM_STATUS_OFF: "Выключен",
  PREMIUM_EXTEND_HINT:
    "Срок добавляется к текущей дате окончания, если премиум уже активен.",
  PREMIUM_PRESETS_ARIA: "Срок премиума",
  /** @param {number} months */
  PREMIUM_PRESET_MONTHS: (months) => `${months} мес.`,
  PREMIUM_CUSTOM_DATE_LABEL: "Своя дата окончания",
  /** @deprecated используйте блок AdminPremiumStaffControl */
  LABEL_PREMIUM_EXPIRES_AT: "Премиум до (дата и время)",
  /** @deprecated */
  LABEL_PREMIUM_EXPIRES_HINT:
    "Пусто или прошедшая дата — премиум выключен. Будущая дата — премиум активен.",
  /** @param {string} userName */
  DISABLE_PREMIUM_CONFIRM: (userName) => `Отключить премиум у «${userName}»?`,
  PREMIUM_REVOKED_TOAST: "Премиум отключён",
  PREMIUM_MODERATOR_CANNOT_EDIT_ADMIN:
    "Модератор не может менять премиум администратора",
  LABEL_ACCOUNT_ACTIVE: "Учётка активна",
  LABEL_BLOCKED: "Заблокирован",
  LABEL_USER_DATA_CONFIRMED: "Данные подтверждены",
  EDIT_BUTTON: "Редактировать",
  DELETE_BUTTON: "Удалить пользователя",
  DELETE_CONFIRM_TITLE: "Удалить пользователя?",
  DELETE_CONFIRM_HINT: (token) => `Введите «${token}» для подтверждения`,
  DELETE_CONFIRM_PLACEHOLDER: "Подтверждение",
  DELETE_SUBMIT: "Удалить",
  DELETE_CANCEL: "Отмена",
  DELETE_LOADING: "Удаление…",
};

/**
 * Самоудаление аккаунта владельцем (не админское удаление чужого).
 * Состав данных синхронен с server/services/user/runProfileDeleteCascade.js
 * и с mobile DELETE_ACCOUNT_UI.
 */
export const DELETE_ACCOUNT_UI = {
  NAV_BUTTON: "Удалить аккаунт",
  DELETE_CONFIRM_TITLE: "Удалить аккаунт?",
  /** @param {string} token */
  DELETE_CONFIRM_HINT: (token) =>
    `Безвозвратно удалим профиль и личные данные, ваши товары, оценки и отзывы, подписки, избранное и корзину. История заказов и договоры рассрочки сохранятся — этого требует бухгалтерская и налоговая отчётность. Восстановить аккаунт будет невозможно. Введите «${token}» для подтверждения.`,
  DELETE_CONFIRM_PLACEHOLDER: "Подтверждение",
  DELETE_SUBMIT: "Удалить аккаунт",
  DELETE_CANCEL: "Отмена",
  DELETE_LOADING: "Удаление…",
};

/** Визуал премиум-пользователя (галочка, золотая обводка аватара). */
export const USER_PREMIUM_UI = {
  CHECK_GLYPH: "✓",
  CHECK_ARIA: "Премиум-пользователь",
  CHECK_TITLE: "Премиум",
};

export const USER_DATA_CONFIRMED_UI = {
  BADGE_ARIA: "Данные подтверждены",
  BADGE_TITLE: "Данные подтверждены",
};

/** Строка каталога пользователей */
export const USER_LIST_ROW_UI = {
  BADGE_PREMIUM: "Премиум",
  BADGE_BLOCKED: "Блок",
  BADGE_INACTIVE: "Откл.",
  MISSING_NAME: COMMON_UI.EM_DASH,
  RATING_TITLE: "Средняя оценка · число голосов",
  RATING_SCORE_LABEL: "Оценка",
  TOTAL_SALES_LABEL: "Продаж на сумму",
  TOTAL_SALES_COUNT_LABEL: "Продаж",
  TOTAL_PURCHASES_LABEL: "Покупок на сумму",
  RATING_LABEL: "Рейтинг",
  USER_DATA_CONFIRMED_LABEL: "Пользователь подтверждён",
  FOLLOWERS_LABEL: "Подписчики",
  LOYALTY_POINTS_LABEL: "Баллы",
};

/** Модалка при достижении лимита товаров продавца */
export const SELLER_PRODUCTS_LIMIT_MODAL_UI = {
  TITLE: "Лимит товаров",
  BODY_REGULAR: (limit, premiumLimit) =>
    `Достигнут лимит размещения товаров (${limit}). Увеличить лимит до ${premiumLimit} можно, оформив премиум.`,
  BODY_PREMIUM: (limit) =>
    `Достигнут максимальный лимит премиум (${limit} товаров). Чтобы разместить новый товар, удалите один из существующих.`,
  CLOSE: "Понятно",
  ARIA_CLOSE_BACKDROP: "Закрыть",
};

/**
 * Подсказка при попытке действия, требующего премиум или подтверждённый аккаунт.
 * Объясняет, чего не хватает и как это получить, и ведёт в нужный раздел профиля.
 */
export const ACCOUNT_REQUIREMENT_MODAL_UI = {
  ARIA_DIALOG: "Требуется доступ",
  /** @param {string} [actionLabel] действие, которое пытался выполнить пользователь */
  INTRO: (actionLabel) =>
    actionLabel
      ? `Чтобы ${actionLabel}, нужен ещё один шаг.`
      : "Для этого действия нужен ещё один шаг.",
  BENEFITS_TITLE: "Что вы получите:",
  CLOSE: "Позже",
  premium: {
    TITLE: "Нужен премиум",
    DESCRIPTION:
      "Действие доступно пользователям с активным премиумом. Его можно оформить за баллы лояльности — срок 1 месяц.",
    BENEFITS: [
      "До 30 товаров в каталоге",
      "Золотая обводка и галочка у имени",
      "Сторис и фон профиля",
    ],
    CTA: "Оформить премиум",
  },
  "data-confirmation": {
    TITLE: "Нужен подтверждённый аккаунт",
    DESCRIPTION:
      "Действие доступно после подтверждения данных. Приложите фото с паспортом — модератор проверит заявку.",
    BENEFITS: [
      "Отзывы после подтверждённой покупки",
      "Ставки на аукционе",
      "Покупка и продажа в рассрочку",
      "Баллы лояльности за покупки",
      "Значок подтверждённого аккаунта",
    ],
    CTA: "Подтвердить данные",
  },
};

/** Модалка создания товара (`POST /product`) */
export const CREATE_PRODUCT_MODAL_UI = {
  ARIA_DIALOG: "Создание товара",
  ARIA_DIALOG_EDIT: "Редактирование товара",
  ARIA_CLOSE_BACKDROP: "Закрыть окно создания товара",
  ARIA_CLOSE_BACKDROP_EDIT: "Закрыть окно редактирования товара",
  TITLE: "Новый товар",
  TITLE_EDIT: "Редактирование товара",
  EDIT_WIZARD_PROGRESS_ARIA: "Шаги редактирования товара",
  EDIT_WIZARD_STEP_MANAGE_TITLE: "Управление товаром",
  EDIT_WIZARD_STEP_MANAGE_SUBTITLE: "Видимость, аукцион и рассрочка",
  EDIT_WIZARD_STEP_LABEL_MANAGE: "Ещё",
  SECTION_BASIC: "Основное",
  SECTION_MEDIA: "Фото и видео",
  SECTION_COMMERCE: "Цена и продажа",
  CANCEL: "Отмена",
  LABEL_NAME: "Название",
  LABEL_DESCRIPTION: "Описание (до 2000 символов)",
  LABEL_LISTING_ORIGIN: "Статус товара",
  LISTING_ORIGIN_OWN: "Продаю свое",
  LISTING_ORIGIN_RESALE: "Приобретен на продажу",
  LISTING_ORIGIN_MANUFACTURER: "Являюсь производителем",
  ERROR_LISTING_ORIGIN: "Выберите статус товара",
  ORIGINALITY_STATEMENT:
    "Я как официальный продавец, заявляю что продаю официальный товар",
  ORIGINALITY_YES: "Да",
  ORIGINALITY_NO: "Нет",
  ERROR_ORIGINALITY: "Выберите: оригинал или нет",
  LABEL_ORIGINALITY: "Оригинал",
  CHARS_USED: (n, max) => `Символов: ${n} / ${max}`,
  LABEL_IMAGE_URLS: "Изображения (обязательно, до 5 — ссылка или файл)",
  IMAGE_ORDER_HINT: "Перетащите за ⋮⋮ — порядок в каталоге (1 — главное фото).",
  DRAG_HANDLE_ARIA: "Перетащить для смены порядка",
  ADD_IMAGE_ROW: "Добавить ещё фото",
  REMOVE_IMAGE_ROW_ARIA: "Удалить поле ссылки на изображение",
  IMAGE_ROW_ARIA_PREFIX: "Ссылка на изображение",
  LABEL_PRICE: "Цена",
  LABEL_OLD_PRICE: "Старая цена (необязательно)",
  LABEL_DISCOUNT_PREVIEW: "Скидка",
  ERROR_OLD_PRICE: "Старая цена должна быть больше текущей",
  LABEL_CATEGORY: "Категория",
  LABEL_SALE_CITY: "Город продажи",
  PLACEHOLDER_SALE_CITY: "Город, где продаётся товар",
  HINT_SALE_CITY: "Пусто — товар виден во всех городах",
  ERROR_SALE_CITY_MAX: `Город продажи не длиннее ${80} символов`,
  LABEL_SALE_REGION: "Регион продажи",
  PLACEHOLDER_SALE_REGION: "Выберите регион",
  HINT_SALE_REGION: "Товар будет виден покупателям этого региона",
  ERROR_SALE_REGION_REQUIRED: "Выберите регион продажи",
  LABEL_PICKUP_ADDRESS: "Адрес самовывоза",
  ERROR_PICKUP_COORDS: "Укажите точку на карте или выберите адрес из подсказки",
  ERROR_CATEGORY_LEAF: "Выберите конечную подкатегорию в дереве категорий",
  LABEL_AVAILABLE: "Товар в наличии",
  LABEL_STOCK_QUANTITY: "Количество в наличии (шт.)",
  ERROR_STOCK: "Укажите количество от 1 до 9999",
  MANAGE_SECTION_TITLE: "Управление товаром",
  MANAGE_SECTION_ARIA: "Дополнительные действия с товаром",
  MANAGE_AUCTION_TITLE: "Аукцион",
  MANAGE_AUCTION_HINT: "Покупатели смогут предлагать свою цену",
  MANAGE_AUCTION_STATUS_ACTIVE: "(активен)",
  MANAGE_AUCTION_STATUS_INACTIVE: "(неактивен)",
  MANAGE_INSTALLMENT_TITLE: "Рассрочка",
  MANAGE_INSTALLMENT_HINT: "Покупатель оплачивает товар частями по графику",
  INSTALLMENT_TOGGLE_PENDING: "Обновляем рассрочку…",
  MANAGE_WHOLESALE_TITLE: "Оптовая цена",
  MANAGE_WHOLESALE_HINT: "Скидка при покупке от указанного количества",
  MANAGE_WHOLESALE_PENDING: "Сохраняем опт…",
  WHOLESALE_MODAL_TITLE: "Оптовая цена",
  WHOLESALE_MODAL_MIN_QTY_LABEL: "Количество от, шт.",
  WHOLESALE_MODAL_PRICE_LABEL: "Оптовая цена, ₽",
  WHOLESALE_MODAL_SAVE: "Сохранить",
  WHOLESALE_MODAL_CLOSE: "Закрыть",
  WHOLESALE_MODAL_HINT: "Покупатель получит эту цену за единицу, если возьмёт не меньше указанного количества",
  WHOLESALE_MODAL_ERROR_REQUIRED: "Укажите количество и оптовую цену",
  WHOLESALE_MODAL_ERROR_MIN_QTY: "Минимум 2 шт.",
  WHOLESALE_MODAL_ERROR_PRICE: "Оптовая цена должна быть меньше обычной",
  WHOLESALE_TOGGLE_PENDING: "Обновляем опт…",
  MANAGE_VISIBILITY_TITLE_VISIBLE: "Виден в каталоге",
  MANAGE_VISIBILITY_TITLE_HIDDEN: "Скрыт от покупателей",
  MANAGE_VISIBILITY_STATUS_VISIBLE: "(виден)",
  MANAGE_VISIBILITY_STATUS_HIDDEN: "(не виден)",
  MANAGE_VISIBILITY_HINT_VISIBLE: "Товар доступен для просмотра и покупки",
  MANAGE_VISIBILITY_HINT_HIDDEN: "Только вы видите товар в личном кабинете",
  MANAGE_DELETE_TITLE: "Удалить товар",
  MANAGE_DELETE_HINT: "Безвозвратно уберёт товар из каталога",
  MANAGE_RAFFLE_TITLE: "Участие в розыгрыше",
  MANAGE_RAFFLE_HINT: "Товар участвует в активном розыгрыше продавца",
  LABEL_AUCTION: "Проводить аукцион (предложения цены)",
  LABEL_LOYALTY_POINTS_PER_UNIT: "Баллов за 1 шт. покупателю",
  /**
   * @param {number} available
   * @param {number} catalogCommitted
   * @param {number} maxPerUnit
   */
  HINT_LOYALTY_POINTS_PER_UNIT: (available, catalogCommitted, maxPerUnit) => {
    const base = `Списание при подтверждении покупки. Свободно: ${available}`;
    if (catalogCommitted > 0) {
      return `${base}; на других товарах уже ${catalogCommitted} за штуку — для этого не больше ${maxPerUnit}. 0 — не давать баллов.`;
    }
    return `${base}; для этого товара не больше ${maxPerUnit}. 0 — не давать баллов.`;
  },
  HINT_LOYALTY_POINTS_ZERO_BALANCE:
    "Недостаточно свободных баллов (учтены другие товары и заказы в работе). Пополните баллы или уменьшите бонус на других товарах.",
  /**
   * @param {number} max
   * @param {number} catalogCommitted
   */
  ERROR_LOYALTY_POINTS_MAX: (max, catalogCommitted = 0) =>
    catalogCommitted > 0
      ? `Не больше ${max} (на других товарах уже закреплено ${catalogCommitted} за штуку)`
      : `Не больше ${max} (доступно на счёте)`,
  SUBMIT_IDLE: "Создать",
  SUBMIT_LOADING: "Создаём…",
  SUBMIT_EDIT_IDLE: "Сохранить",
  SUBMIT_EDIT_LOADING: "Сохраняем…",
  ERROR_PRICE: "Укажите корректную цену (число ≥ 0)",
  ERROR_PRICE_MAX: "Цена не может превышать 999 999 999 ₽",
  ERROR_GENERIC: "Не удалось создать товар",
  ERROR_EDIT_GENERIC: "Не удалось сохранить изменения",
  ERROR_PREVIEW_VIDEO_REQUIRES_PHOTO: "При превью-видео нужно хотя бы одно фото товара",
  ERROR_IMAGE_REQUIRED: "Добавьте хотя бы одно фото товара",
  LABEL_CHARACTERISTICS: "Характеристики (необязательно)",
  CHARACTERISTICS_SECTION_ARIA: "Характеристики товара",
  HINT_CHARACTERISTICS: (max) =>
    `До ${max} пар «ключ — значение». Пустые строки не сохраняются.`,
  PLACEHOLDER_CHARACTERISTIC_KEY: "Свойство",
  PLACEHOLDER_CHARACTERISTIC_VALUE: "Значение",
  ADD_CHARACTERISTIC_ROW: "+ Характеристика",
  CHARACTERISTIC_ROW_ARIA: (index) => `Характеристика ${index}`,
  WIZARD_ERROR_NAME: "Название: от 3 до 100 символов",
  WIZARD_STEP_BASIC_TITLE: "О товаре",
  WIZARD_STEP_BASIC_SUBTITLE: "Название и описание — первое, что видит покупатель",
  WIZARD_STEP_ORIGINALITY_TITLE: "Оригинал",
  WIZARD_STEP_ORIGINALITY_SUBTITLE: "Подтвердите, что продаёте официальный товар",
  WIZARD_STEP_MEDIA_TITLE: "Фото и видео",
  WIZARD_STEP_MEDIA_SUBTITLE:
    "До 5 фото, можно выбрать несколько сразу. Первое — обложка",
  WIZARD_STEP_CATEGORY_TITLE: "Категория и регион",
  WIZARD_STEP_CATEGORY_SUBTITLE: "Помогите покупателям найти товар в каталоге",
  WIZARD_STEP_PICKUP_TITLE: "Самовывоз",
  WIZARD_STEP_PICKUP_SUBTITLE: "Укажите адрес, куда покупатель сможет подъехать",
  WIZARD_STEP_COMMERCE_TITLE: "Цена и наличие",
  WIZARD_STEP_COMMERCE_SUBTITLE: "Укажите стоимость и сколько единиц готовы продать",
  WIZARD_STEP_RETURNS_TITLE: "Возврат",
  WIZARD_STEP_RETURNS_SUBTITLE: "Есть ли возврат и какие условия",
  WIZARD_STEP_REVIEW_TITLE: "Проверка",
  WIZARD_STEP_REVIEW_SUBTITLE: "Всё верно? Отправим товар на модерацию",
  WIZARD_RETURNS_LEAD: "Есть ли возврат?",
  LABEL_RETURN_ENABLED: "Возврат",
  RETURN_YES: "Да",
  RETURN_NO: "Нет",
  HINT_RETURN_TERMS: "Пример: возврат в течение — 15 дней",
  PLACEHOLDER_RETURN_TERM_KEY: "Свойство",
  PLACEHOLDER_RETURN_TERM_VALUE: "Значение",
  ADD_RETURN_TERM_ROW: "+ Добавить условие",
  RETURN_TERMS_SECTION_ARIA: "Условия возврата",
  RETURN_TERM_ROW_ARIA: (index) => `Условие возврата ${index}`,
  REMOVE_RETURN_TERM_ROW_ARIA: (index) => `Удалить условие возврата ${index}`,
  ERROR_RETURN_CHOICE: "Выберите: есть ли возврат",
  WIZARD_MEDIA_LEAD: "Добавьте хотя бы одно фото — без него товар не опубликуется.",
  WIZARD_MEDIA_COVER_BADGE: "Обложка",
  WIZARD_MEDIA_COVER_LABEL: "Обложка в каталоге",
  WIZARD_MEDIA_COVER_EMPTY: "Добавьте фото — первое станет обложкой",
  WIZARD_MEDIA_GALLERY_LABEL: "Галерея",
  WIZARD_MEDIA_GALLERY_HINT:
    "Листайте галерею и меняйте порядок стрелками. Первое фото — главное. В каталоге обложка показывается в квадрате — центр кадра попадёт в превью.",
  WIZARD_MEDIA_CROP_HINT:
    "В каталоге обложка показывается в квадрате — центр кадра попадёт в превью.",
  WIZARD_MEDIA_TAP_TO_COVER_HINT: "Нажмите на фото, чтобы сделать его обложкой",
  WIZARD_MEDIA_MOVE_EARLIER: "Левее",
  WIZARD_MEDIA_MOVE_EARLIER_ARIA: "Сдвинуть фото левее",
  WIZARD_MEDIA_MOVE_LATER: "Правее",
  WIZARD_MEDIA_MOVE_LATER_ARIA: "Сдвинуть фото правее",
  WIZARD_MEDIA_SLOT_ARIA: (index) => `Фото ${index}`,
  WIZARD_MEDIA_SLOT_EMPTY: "Пусто",
  WIZARD_MEDIA_ADD_SLOT: "Добавить фото",
  WIZARD_MEDIA_ADD_PHOTO_TILE: "Фото",
  WIZARD_MEDIA_ADD_PHOTO_ARIA: "Добавить фото",
  WIZARD_MEDIA_EDITOR_LABEL: (index, isCover) =>
    isCover ? `Фото ${index} · обложка` : `Фото ${index}`,
  WIZARD_MEDIA_REMOVE: "Удалить фото",
  WIZARD_MEDIA_VIDEO_TITLE: "Видео-превью",
  WIZARD_MEDIA_VIDEO_OPTIONAL: "Необязательно",
  WIZARD_MEDIA_VIDEO_OPTIONAL_TAG: "(необязательно)",
  WIZARD_MEDIA_VIDEO_LEAD: "Короткий ролик помогает показать товар в движении.",
  WIZARD_MEDIA_VIDEO_DURATION_HINT:
    "До 3 секунд: более длинный ролик автоматически обрежется при загрузке. Нужно хотя бы одно фото товара.",
  WIZARD_MEDIA_VIDEO_PICK: "Выбрать видео",
  WIZARD_MEDIA_VIDEO_REPLACE: "Заменить видео",
  WIZARD_MEDIA_VIDEO_CLEAR: "Убрать видео",
  WIZARD_MEDIA_VIDEO_UPLOAD_LOADING: "Загружаем…",
  WIZARD_MEDIA_VIDEO_TOGGLE_OPEN: "Добавить видео",
  WIZARD_MEDIA_VIDEO_TOGGLE_CLOSE: "Скрыть блок видео",
  WIZARD_MEDIA_FILLED_COUNT: (count, max) => `${count} из ${max} фото`,
  WIZARD_CATEGORY_LEAD: "Выберите самую точную подкатегорию.",
  WIZARD_COMMERCE_LEAD: "Старая цена покажет скидку, если она выше текущей.",
  WIZARD_REVIEW_LEAD: "Проверьте данные перед публикацией. Любой блок можно изменить.",
  WIZARD_REVIEW_EDIT: "Изменить",
  WIZARD_REVIEW_EMPTY: "—",
  WIZARD_REVIEW_ALL_CITIES: "Все города",
  WIZARD_REVIEW_HIDDEN: "Скрыт из каталога",
  /** @param {number} imageCount @param {unknown} previewVideoUrl */
  WIZARD_REVIEW_MEDIA: (imageCount, previewVideoUrl) => {
    const parts = [];
    if (imageCount > 0) {
      parts.push(`${imageCount} фото`);
    }
    if (String(previewVideoUrl ?? "").trim()) {
      parts.push("видео");
    }
    return parts.length > 0 ? parts.join(", ") : "Без медиа";
  },
  WIZARD_PLACEHOLDER_NAME: "Например: iPhone 15 Pro 256 ГБ",
  WIZARD_PLACEHOLDER_DESCRIPTION: "Состояние, комплектация, особенности…",
  WIZARD_BACK: "Назад",
  WIZARD_NEXT: "Далее",
  WIZARD_SUBMIT: "Отправить на проверку",
  WIZARD_PROGRESS_ARIA: "Шаги размещения товара",
  /** @param {number} current @param {number} total */
  WIZARD_STEP_OF: (current, total) => `Шаг ${current} из ${total}`,
  WIZARD_STEP_LABEL_BASIC: "О товаре",
  WIZARD_STEP_LABEL_ORIGINALITY: "Оригинал",
  WIZARD_STEP_LABEL_MEDIA: "Медиа",
  WIZARD_STEP_LABEL_CATEGORY: "Категория",
  WIZARD_STEP_LABEL_PICKUP: "Самовывоз",
  WIZARD_STEP_LABEL_COMMERCE: "Цена",
  WIZARD_STEP_LABEL_RETURNS: "Возврат",
  WIZARD_STEP_LABEL_REVIEW: "Проверка",
  REMOVE_CHARACTERISTIC_ROW_ARIA: (index) => `Удалить характеристику ${index}`,
  ERROR_CHARACTERISTIC_PAIR: "У каждой характеристики должны быть и ключ, и значение",
  ERROR_CHARACTERISTIC_KEY_MAX: (max) =>
    `Ключ характеристики не длиннее ${max} символов`,
  ERROR_CHARACTERISTIC_VALUE_MAX: (max) =>
    `Значение характеристики не длиннее ${max} символов`,
  ERROR_CHARACTERISTIC_DUPLICATE_KEY: (key) =>
    `Дубликат ключа характеристики: «${key}»`,
  ERROR_CHARACTERISTICS_MAX: (max) => `Не более ${max} характеристик`,
};

export const PRODUCT_CATEGORY_TREE_UI = {
  WIZARD_HINT: "Дойдите до конечной подкатегории (пункт с пометкой «конечная»).",
  STEP_ROOT: "Раздел каталога",
  BACK: "Назад",
  CHANGE_CATEGORY: "Изменить категорию",
  PICK_SUBCATEGORY: "Выбрать подкатегорию",
  SELECTED_PREFIX: "Выбрано:",
  LEAF_BADGE: "конечная",
  LOADING: "Загрузка категорий…",
  LOAD_ERROR: "Не удалось загрузить категории",
  SWITCH_TO_LEGACY: "Общий список категорий",
  SWITCH_TO_TREE: "Выбрать по подрубрикам",
  TRAIL_ARIA: "Путь по категориям",
  CATALOG_FILTER_OPEN: "Фильтр по подкатегориям",
  CATALOG_FILTER_HINT:
    "Выберите раздел или дойдите до конечной подкатегории для фильтра ленты.",
  CATALOG_FILTER_HINT_SHORT: "Дойдите до конечной подкатегории",
  FILTER_PREFIX: "Фильтр:",
  PICK_LEAF: "Выбрать",
  EMPTY_LEVEL: "Нет подкатегорий на этом уровне",
  CLEAR_FILTER: "Сбросить фильтр",
  CLOSE: "Закрыть",
};

/** Модалка карточки товара в каталоге */
export const PRODUCT_DETAILS_MODAL_UI = {
  BACK_ARIA: "Назад",
  GALLERY_THUMBS_ARIA: "Дополнительные фотографии товара",
  OPEN_GALLERY_FULLSCREEN: "Просмотреть все фото в полном экране",
  SLIDER_REGION_ARIA: "Слайдер фотографий товара",
  DETAILS_SECTION_ARIA: "Описание и служебная информация о товаре",
  LISTING_ORIGIN_UNSPECIFIED: "Не указано",
  LISTING_ORIGIN_SLOT_ARIA: "Статус товара",
  PRICE_MARKET_STATUS_SLOT_ARIA: "Статус цены",
  PRICE_MARKET_STATUS_ABOVE: "Цена выше рыночной",
  PRICE_MARKET_STATUS_AT: "Цена по рыночной стоимости",
  PRICE_MARKET_STATUS_BELOW: "Цена ниже рыночной",
  PRICE_MARKET_STATUS_UNKNOWN: "Статус цены не определен",
  ORIGINAL_BADGE: "Оригинал",
  ORIGINAL_BADGE_ARIA: "Оригинальный товар",
  CONTENT_SWITCHER_ARIA: "Описание и характеристики товара",
  DESCRIPTION_SECTION_ARIA: "Описание товара",
  SALE_CITY_ALL: "Во всех городах",
  CHARACTERISTICS_TITLE: "Характеристики",
  CHARACTERISTICS_SECTION_ARIA: "Характеристики товара",
  RETURNS_TITLE: "Возврат",
  RETURNS_SECTION_ARIA: "Условия возврата",
  RETURNS_PLACEHOLDER: "Сведения о возврате появятся позже.",
  RETURNS_NONE: "Возврат не предусмотрен.",
  DELIVERY_TITLE: "Получение",
  DELIVERY_SECTION_ARIA: "Самовывоз и доставка",
  DELIVERY_IN_DEVELOPMENT: "В разработке",
  COPY_ID_ARIA: "Скопировать ID",
  COPY_ID_DONE_ARIA: "ID скопирован",
  COPY_ID_FAILED: "Не удалось скопировать ID",
};

/** Превью продавца в модалке товара */
export const PRODUCT_SELLER_PREVIEW_UI = {
  SECTION_LABEL: "Продавец",
  OPEN_PROFILE_ARIA: "Открыть профиль продавца",
  LISTED_PRODUCTS_LABEL: "Товаров в продаже",
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
  PROMOTION_BUTTON: "Управление",
  DELETE_PRODUCT: "Удалить товар",
  DELETE_PRODUCT_PENDING: "Удаление…",
  DELETE_CONFIRM_QUESTION: "Вы уверены, что хотите удалить этот товар?",
  DELETE_CONFIRM_YES: "Да, удалить",
  DELETE_CONFIRM_CANCEL: "Отмена",
  OPEN_SALES_LOCKED_HINT:
    "Скрыть или удалить можно, когда все покупки по товару подтверждены покупателями (или отменены).",
  HIDDEN_FROM_CATALOG_BADGE: "Скрыт от покупателей",
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
  INSTALLMENT_BADGE: "Рассрочка",
  WHOLESALE_BADGE: "Опт",
  INSTALLMENT_SELL_BUTTON: "Продать в рассрочку",
};

/** Оптовая цена (карточка / детали) */
export const PRODUCT_WHOLESALE_UI = {
  DETAILS_OFFER_KICKER: "Оптовая цена",
  DETAILS_OFFER_UNIT: "/ шт.",
  /** @param {number} minQty */
  DETAILS_OFFER_FROM_QTY: (minQty) => `от ${minQty} шт.`,
  /**
   * @param {number} minQty
   * @param {string} priceLabel
   * @param {number} percent
   */
  DETAILS_OFFER_SUBTITLE: (minQty, priceLabel, percent) =>
    `от ${minQty} шт. ${priceLabel} (−${percent}%)`,
  /** @param {string} savingsLabel */
  DETAILS_OFFER_SAVINGS: (savingsLabel) => `экономия ${savingsLabel} с единицы`,
  /** @param {number} percent */
  DETAILS_OFFER_DISCOUNT: (percent) => `−${percent}%`,
  DETAILS_OFFER_GO: "Купить оптом",
  DETAILS_OFFER_GO_ARIA: "Добавить в корзину по оптовой цене",
  DETAILS_OFFER_ARIA: "Доступна оптовая цена",
};

/** Рассрочка */
export const INSTALLMENT_UI = {
  BADGE: "Рассрочка",
  TAB: "Рассрочка",
  SHORTCUT: "В рассрочку",
  DETAILS_TEASER_TITLE: "Рассрочка",
  /** @param {string} monthlyLabel */
  DETAILS_TEASER_FROM_MONTHLY: (monthlyLabel) => `от ${monthlyLabel} / мес`,
  DETAILS_TEASER_GO: "Оформить сейчас",
  DETAILS_TEASER_ARIA: "Открыть вкладку рассрочки",
  BUYER_HINT: "Оформление рассрочки доступно пользователям с подтверждёнными данными.",
  BUYER_REQUIRES_CONFIRMED:
    "Рассрочка доступна только пользователям с подтверждёнными данными.",
  BUYER_PRODUCT_PRICE_LABEL: "Цена товара",
  BUYER_MARKUP_LABEL: "Переплата",
  PLANS_LABEL: "План рассрочки",
  FIRST_PAYMENT_LATER: "первый платёж позже",
  QUANTITY_LABEL: "Количество",
  MONTHLY_LABEL: "Ежемесячно",
  TOTAL_LABEL: "Итого по договору",
  PAYMENT_METHOD_LABEL: "Способ оплаты",
  SUBMIT: "Оформить рассрочку",
  SUBMITTING: "Оформляем…",
  SELECT_PLAN: "Выберите план рассрочки",
  CONTRACT_SUCCESS: "Рассрочка оформлена. Следите за графиком платежей.",
  ERROR_GENERIC: "Не удалось выполнить действие",
  PASSPORT_SHARE_CONSENT_TITLE: "Согласие на передачу паспортных данных",
  PASSPORT_SHARE_CONSENT_PARAGRAPHS: [
    "Нажимая «Разрешить и оформить», вы даёте отдельное согласие оператору сервиса iziBuy на передачу продавцу выбранного товара ваших паспортных данных, ранее предоставленных при подтверждении аккаунта: фамилия, имя, отчество (при наличии), дата рождения, серия и номер паспорта, сведения о выдаче (кем выдан, дата выдачи, код подразделения), а также фотография с паспортом в руках.",
    "Цель передачи — идентификация покупателя и рассмотрение (исполнение) заявки на покупку товара в рассрочку по этой сделке. Получатель — продавец указанного товара (третье лицо). Передача выполняется однократно в составе заявки на покупку.",
    "Согласие даётся добровольно. Без него оформить покупку в рассрочку нельзя. Отказ («Отмена») не ограничивает иные покупки без рассрочки.",
    "Вы вправе отозвать согласие, обратившись к оператору по контактам из Политики конфиденциальности. Отзыв не отменяет законность передачи, уже совершённой до отзыва. Дальнейшую обработку полученных данных продавец осуществляет самостоятельно в соответствии с законодательством РФ.",
    "Подтверждая действие, вы также подтверждаете, что ознакомлены с Политикой конфиденциальности сервиса.",
  ],
  PASSPORT_SHARE_CONSENT_CANCEL: "Отмена",
  PASSPORT_SHARE_CONSENT_CONFIRM: "Разрешить и оформить",
  PASSPORT_SHARE_SECTION: "Паспорт покупателя",
  PASSPORT_SHARE_SELFIE_SECTION: "Фото с паспортом в руках",
  PASSPORT_SHARE_SELFIE_OPEN: "Открыть фото в полном размере",
  PASSPORT_SHARE_SELFIE_MISSING: "Фото не приложено",
  PASSPORT_SHARE_SELFIE_LOAD_ERROR: "Не удалось загрузить фото",
  MODERATION_PENDING: "Программа на модерации",
  PROGRAM_MODAL_REJECTED_HINT:
    "Программа была отклонена ранее. Исправьте планы и сохраните снова — рассрочка сразу станет доступна покупателям.",
  PROGRAM_MODAL_APPROVED_HINT: "Рассрочка активна — покупатели могут оформить её на этот товар.",
  MODERATION_REJECTED: "Программа отклонена",
  MODERATION_APPROVED: "Рассрочка активна",
  SELLER_TAB_HINT: "Настройте планы в «Изменить товар» → «Продать в рассрочку».",
  PROGRAM_MODAL_TITLE: "Рассрочка на товар",
  PROGRAM_MODAL_PLAN_NUMBER: (n) => `План ${n}`,
  PROGRAM_MODAL_PLAN_TITLE: "Название плана",
  PROGRAM_MODAL_PLAN_TITLE_PLACEHOLDER: "Например: Стандарт",
  PROGRAM_MODAL_ERROR_NO_PLANS: "Добавьте хотя бы один план рассрочки",
  /** @param {number} planNumber */
  PROGRAM_MODAL_ERROR_PLAN_TITLE: (planNumber) =>
    `План ${planNumber}: укажите название`,
  /** @param {number} planNumber @param {number} maxLength */
  PROGRAM_MODAL_ERROR_PLAN_TITLE_MAX: (planNumber, maxLength) =>
    `План ${planNumber}: название не длиннее ${maxLength} символов`,
  /** @param {number} planNumber @param {number} min @param {number} max */
  PROGRAM_MODAL_ERROR_PLAN_MONTHS: (planNumber, min, max) =>
    `План ${planNumber}: срок от ${min} до ${max} мес.`,
  /** @param {number} planNumber @param {number} minRub */
  PROGRAM_MODAL_ERROR_PLAN_MONTHLY: (planNumber, minRub) =>
    `План ${planNumber}: минимальный платёж ${minRub} ₽`,
  PROGRAM_MODAL_MONTHS: "Месяцев",
  PROGRAM_MODAL_MARKUP_PERCENT: "Надбавка, %",
  PROGRAM_MODAL_MONTHLY: "Платёж, ₽",
  PROGRAM_MODAL_PLAN_ORIGINAL_PRICE: (formatted) => `Цена товара: ${formatted}`,
  PROGRAM_MODAL_PLAN_MARKUP: (rubFormatted, percent) =>
    `Надбавка: +${rubFormatted} (+${percent}%)`,
  PROGRAM_MODAL_PLAN_TOTAL: (formatted) => `Итого ${formatted}`,
  PROGRAM_MODAL_FIRST_NOW: "Первый платёж сразу",
  PROGRAM_MODAL_ADD_PLAN: "Добавить план",
  PROGRAM_MODAL_REMOVE_PLAN: "Удалить",
  PROGRAM_MODAL_SAVE: "Сохранить",
  PROGRAM_MODAL_SAVING: "Сохраняем…",
  PROGRAM_MODAL_MAX_PLANS: (max) => `Не больше ${max} планов`,
  PROGRAM_MODAL_SUCCESS: "Программа сохранена и активна",
  OVERDUE_BADGE: "Просрочка",
  CONTRACT_PRODUCT: "Товар",
  SELLER_LABEL: "Продавец",
  BUYER_LABEL: "Покупатель",
  BUYERS_LABEL: "Покупатели",
  BUYER_PROFILE_ARIA: (buyerName) => `Профиль покупателя: ${buyerName}`,
  CONTRACT_PLAN: "План",
  CONTRACT_STATUS: "Статус",
  CONTRACT_PAID: "Оплачено",
  CONTRACT_REMAINING: "Осталось",
  CONTRACT_DAYS_LEFT: (days) => `Дней до конца: ${days}`,
  PAYMENTS_HEADING: "График платежей",
  PAYMENTS_FOCUS_HEADING: "Сейчас",
  /** @param {number} count */
  PAYMENTS_UPCOMING_SUMMARY: (count) => `Запланировано · ${count}`,
  /** @param {number} count */
  PAYMENTS_HISTORY_SUMMARY: (count) => `Оплачено · ${count}`,
  PAYMENT_DUE: "Срок",
  PAYMENT_AMOUNT: "Сумма",
  MARK_PAID: "Я оплатил",
  CONFIRM_PAYMENT: "Подтвердить оплату",
  REJECT_PAYMENT: "Отклонить оплату",
  REJECT_EARLY_PAYOFF: "Отклонить досрочное погашение",
  EARLY_PAYOFF: "Досрочное погашение",
  CANCEL_EARLY_PAYOFF: "Отменить досрочное погашение",
  CONFIRM_EARLY_PAYOFF: "Подтвердить досрочное погашение",
  OPEN_DISPUTE: "Открыть спор",
  DISPUTE_REASON_PLACEHOLDER: "Причина спора…",
  SEND_MESSAGE: "Написать продавцу",
  MESSAGE_PLACEHOLDER: "Сообщение…",
  ACTION_PENDING: "Сохраняем…",
  PAYMENTS_PAGE_TITLE: "Покупки - Рассрочка",
  /** @param {number} count */
  COUNT_CONTRACTS: (count) => `${count} договоров`,
  /** @param {number} count */
  COUNT_PROGRAMS: (count) => `${count} программ`,
  /** @param {number} count */
  COUNT_DISPUTES: (count) => `${count} споров`,
  PAYMENTS_PAGE_LOADING: "Загрузка рассрочек…",
  PAYMENTS_PAGE_EMPTY: "У вас пока нет рассрочек.",
  PAYMENTS_PAGE_EMPTY_BY_FILTER: "По выбранному статусу рассрочек нет.",
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
  PAYMENTS_OVERVIEW_ACTIVE: "Активные",
  PAYMENTS_OVERVIEW_ATTENTION: "Нужно действие",
  PAYMENTS_OVERVIEW_REMAINING: "Осталось всего",
  PAYMENTS_EXPAND_ALL: "Развернуть все",
  PAYMENTS_COLLAPSE_ALL: "Свернуть все",
  PAYMENTS_REFRESH: "Обновить",
  /** @param {string} amount @param {string} date */
  PAYMENTS_NEXT_DUE: (amount, date) => `След. платёж: ${amount} · ${date}`,
  PAYMENTS_ATTENTION_FILTER_HINT: "Показаны договоры, где нужно ваше действие",
  /** @param {boolean} expanded */
  PAYMENTS_EXPAND_TOGGLE: (expanded) => (expanded ? "Свернуть" : "Развернуть"),
  SALES_PAGE_TITLE: "Продажи - Рассрочка",
  SALES_PAGE_LOADING: "Загрузка продаж…",
  SALES_PAGE_EMPTY: "Продаж в рассрочку пока нет.",
  SALES_PAGE_EMPTY_BY_FILTER: "По выбранному статусу продаж нет.",
  SALES_OVERVIEW_REMAINING: "К получению",
  SALES_ATTENTION_FILTER_HINT: "Показаны продажи, где нужно подтвердить оплату",
  SALES_NEXT_ACTION_EARLY_PAYOFF: "Досрочное погашение — ждёт подтверждения",
  CONTRACT_STATUS_FILTER_LABEL: "Статус",
  CONTRACT_STATUS_FILTER_ALL: "Все",
  CONTRACT_STATUS_FILTER_IN_PROGRESS: "Активные",
  CONTRACT_STATUS_FILTER_COMPLETED: "Завершённые",
  CONTRACT_STATUS_FILTER_DEFAULTED: "Просрочена",
  CONTRACT_STATUS_FILTER_CANCELLED: "Отменённые",
  DISPUTES_PAGE_TITLE: "Споры по рассрочке",
  DISPUTES_PAGE_LOADING: "Загрузка споров…",
  DISPUTES_PAGE_EMPTY: "Нет открытых споров.",
  DISPUTE_CONTRACT_LABEL: "Контракт",
  DISPUTE_REASON_LABEL: "Причина",
  DISPUTE_RESOLVE_NOTE: "Комментарий staff",
  DISPUTE_ACTION_CLOSE: "Закрыть договор",
  DISPUTE_ACTION_CANCEL: "Отменить договор",
  DISPUTE_ACTION_ADJUST: "Сдвинуть график",
  DISPUTE_ACTION_REFUND: "Частичный возврат",
  DISPUTE_PARTIAL_AMOUNT: "Сумма возврата, ₽",
  DISPUTE_RESOLVE: "Рассмотреть",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
  CONTRACT_STATUS_LABEL: {
    pending_first_payment: "Ожидает первый платёж",
    active: "Активна",
    completed: "Завершена",
    defaulted: "Просрочена",
    cancelled: "Отменена",
  },
  PAYMENT_STATUS_LABEL: {
    scheduled: "Запланирован",
    due: "К оплате",
    overdue: "Просрочен",
    pending_confirmation: "Ожидает подтверждения",
    paid: "Оплачен",
  },
};

export const CREATE_RAFFLE_MODAL_UI = {
  ARIA_DIALOG: "Создание розыгрыша",
  ARIA_DIALOG_EDIT: "Редактирование розыгрыша",
  ARIA_CLOSE: "Закрыть",
  TITLE: "Создать розыгрыш",
  TITLE_EDIT: "Изменить розыгрыш",
  SECTION_BASIC: "Основное",
  SECTION_PRIZE: "Приз",
  SECTION_CONDITIONS: "Условия",
  STEP_SUBTITLE_BASIC: "Название и описание для баннера и карточки розыгрыша.",
  STEP_SUBTITLE_PRIZE: "Фото или видео приза — то, что увидят покупатели.",
  STEP_SUBTITLE_CONDITIONS: "Цель продаж и при желании ссылка Instagram.",
  WIZARD_PROGRESS_ARIA: "Прогресс создания розыгрыша",
  WIZARD_STEP_OF: (current, total) => `Шаг ${current} из ${total}`,
  BTN_NEXT: "Далее",
  BTN_BACK: "Назад",
  BTN_CANCEL: "Отмена",
  CANCEL_CREATE_TITLE: "Отменить создание?",
  CANCEL_CREATE_MESSAGE: (pricePoints) =>
    `Зарезервированные ${pricePoints} баллов разблокируются. Введённые данные не сохранятся.`,
  CANCEL_CREATE_CONFIRM: "Отменить",
  CANCEL_CREATE_SUCCESS: "Создание отменено. Баллы разблокированы.",
  DISCARD_TITLE: "Сбросить создание?",
  DISCARD_MESSAGE: "Введённые данные не сохранятся.",
  DISCARD_CONFIRM: "Сбросить",
  DISCARD_KEEP: "Продолжить",
  EXISTING_PENDING: (title) =>
    `У вас уже есть розыгрыш «${title}» на модерации. Новый нельзя отправить, пока не отзовёте текущий.`,
  EXISTING_IN_PROGRESS: (title) =>
    `У вас уже есть розыгрыш «${title}» в работе. Новый создать нельзя, пока текущий не завершится.`,
  UNLOCK_REQUIRED: "Сначала оплатите создание розыгрыша в разделе «Реклама».",
  GO_TO_ADVERTISING: "Перейти в «Рекламу»",
  BTN_WITHDRAW: "Отозвать с модерации",
  WITHDRAW_CONFIRM_TITLE: "Отозвать заявку?",
  WITHDRAW_CONFIRM: "Розыгрыш будет удалён с модерации. Восстановить нельзя.",
  WITHDRAW_SUCCESS: "Заявка отозвана. Можно создать новый розыгрыш.",
  ERROR_TITLE: "Укажите название",
  ERROR_REGION_REQUIRED: "Выберите регион показа",
  LABEL_REGION: "Регион показа",
  HINT_REGION: "Розыгрыш увидят покупатели только этого региона.",
  ERROR_TARGET: "Укажите цель продаж (число ≥ 1)",
  ERROR_INSTAGRAM: "Укажите ссылку Instagram",
  ERROR_PRIZE_IMAGE: "Загрузите фото приза",
  ERROR_PRIZE_VIDEO: "Загрузите видео приза",
  LABEL_TITLE: "Название",
  LABEL_DESCRIPTION: "Описание",
  LABEL_PRIZE_MEDIA: "Медиа приза (фото или видео)",
  LABEL_PRIZE_MEDIA_TYPE_IMAGE: "Фото",
  LABEL_PRIZE_MEDIA_TYPE_VIDEO: "Видео",
  LABEL_PRIZE_IMAGE: "Фото приза (ссылка или файл)",
  LABEL_PRIZE_VIDEO: "Видео приза (ссылка или файл)",
  PREVIEW_LABEL: "Превью",
  LABEL_TARGET: "Цель продаж",
  LABEL_INSTAGRAM: "Ссылка Instagram",
  SUBMIT: "Отправить на модерацию",
  SUBMIT_EDIT: "Сохранить",
  SUBMIT_LOADING: "Отправляем…",
  SUBMIT_EDIT_LOADING: "Сохраняем…",
  HINT: "После одобрения staff включите участие на своих товарах в «Мои товары».",
  HINT_EDIT_ACTIVE:
    "Изменения цели продаж пересчитают прогресс для активного розыгрыша.",
  HINT_TITLE: "Короткое название для баннера и карусели на главной. До 100 символов.",
  HINT_DESCRIPTION:
    "Условия, описание приза и другие детали для покупателей. Необязательно, до 200 символов.",
  HINT_PRIZE_MEDIA: "Выберите, чем показать приз в баннере розыгрыша — фото или видео.",
  HINT_PRIZE_IMAGE:
    "Загрузите файл или вставьте ссылку http/https либо путь /uploads/… с сервера.",
  HINT_PRIZE_VIDEO:
    "Прямая ссылка на MP4/WebM или видеофайл, загруженный на сервер.",
  HINT_TARGET:
    "Сколько подтверждённых продаж нужно для завершения розыгрыша. Целое число от 1 до 100 000.",
  HINT_INSTAGRAM:
    "Необязательно. Ссылка на Instagram — покупатели увидят её после завершения розыгрыша.",
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

export const RAFFLE_MANAGE_UI = {
  GROUP_LABEL: "Управление розыгрышем",
  EDIT: "Изменить",
  DELETE: "Удалить",
  PAUSE: "Снять с витрины",
  DELETE_CONFIRM_OWNER:
    "Удалить розыгрыш? Участие товаров будет снято, восстановить нельзя.",
  DELETE_CONFIRM_STAFF: "Удалить розыгрыш без возможности восстановления?",
  LIVE_SECTION_TITLE: "Розыгрыш на главной",
};

export const RAFFLE_SELLER_PANEL_UI = {
  TITLE: "Ваш розыгрыш",
  EMPTY: "Активного розыгрыша нет.",
  STATUS_PENDING: "На модерации",
  STATUS_ACTIVE: "На главной",
  STATUS_PAUSED: "Снят с витрины",
  STATUS_COMPLETED: "Завершён",
  STATUS_REJECTED: "Отклонён",
  PAUSE: "Снять с витрины",
  EDIT: "Изменить",
  DELETE: "Удалить",
  DELETE_CONFIRM: "Удалить розыгрыш? Участие товаров будет снято, восстановить нельзя.",
  ARCHIVE_TITLE: "Архив",
  REJECTION_PREFIX: "Причина:",
};

export const RAFFLES_STAFF_PAGE_UI = {
  TITLE: "Розыгрыши",
  QUEUE_TITLE: "Заявки на модерацию",
  EMPTY: "Нет заявок на розыгрыш.",
  LOADING: "Загрузка…",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  EDIT: "Изменить",
  DELETE: "Удалить",
  DELETE_CONFIRM: "Удалить розыгрыш без возможности восстановления?",
  PENDING: "Сохраняем…",
  /** @param {number} count */
  TAB_BADGE: (count) => (count > 99 ? "99+" : String(count)),
  ROW_SELLER: "Продавец",
  ROW_TARGET: "Цель",
};

export const USERS_LOYALTY_RAFFLE_ADMIN_UI = {
  TAB_MODERATION: "Модерация",
  TAB_USERS_RAFFLE: "Среди пользователей",
  TITLE: "Розыгрыш среди пользователей",
  DESCRIPTION_LABEL: "Описание",
  DESCRIPTION_PLACEHOLDER: "Текст под прогресс-баром на странице пользователей",
  GOAL_LABEL: "Цель баллов",
  SAVE: "Сохранить",
  SAVING: "Сохраняем…",
  SAVED: "Сохранено",
  LOADING: "Загрузка…",
};

export const RAFFLE_PRODUCTS_PAGE_UI = {
  TITLE: "Товары розыгрыша",
  EYEBROW: "Розыгрыш",
  LOADING: "Загрузка…",
  EMPTY: "Нет товаров в этом розыгрыше.",
};

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

/** Full-screen auth (parity with mobile AUTH_UI) */
export const AUTH_UI = {
  LOGIN_TITLE: "Вход",
  LOGIN_SUBTITLE: "Войдите, чтобы продолжить покупки",
  REGISTER_TITLE: "Регистрация",
  REGISTER_SUBTITLE: "Создайте аккаунт за пару минут",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "you@example.com",
  PASSWORD_LABEL: "Пароль",
  PASSWORD_PLACEHOLDER: "••••••••",
  PASSWORD_CONFIRM_LABEL: "Повторите пароль",
  PASSWORD_CONFIRM_PLACEHOLDER: "••••••••",
  SHOW_PASSWORD_ARIA: "Показать пароль",
  HIDE_PASSWORD_ARIA: "Скрыть пароль",
  USER_NAME_LABEL: "Имя пользователя",
  USER_NAME_PLACEHOLDER: "username",
  LOGIN_BUTTON: "Войти",
  REGISTER_BUTTON: "Зарегистрироваться",
  LOGOUT_BUTTON: "Выйти",
  GO_TO_REGISTER: "Создать аккаунт",
  GO_TO_LOGIN: "Уже есть аккаунт? Войти",
  BACK_BUTTON: "Назад",
  GUEST_STATUS: "Вы не вошли в аккаунт",
  REGISTER_TERMS_CONSENT_PREFIX: "Я принимаю ",
  REGISTER_TERMS_LINK: "Пользовательское соглашение",
  REGISTER_TERMS_CONSENT_AND: " и ",
  REGISTER_LISTING_LINK: "Правила размещения товаров",
  REGISTER_PRIVACY_CONSENT_PREFIX: "Я даю ",
  REGISTER_PRIVACY_CONSENT_LINK: "согласие на обработку персональных данных",
  REGISTER_PRIVACY_CONSENT_SUFFIX: " в соответствии с ",
  REGISTER_PRIVACY_LINK: "Политикой конфиденциальности",
  REGISTER_CONSENT_REQUIRED: "Подтвердите согласие с документами для регистрации",
  REGISTER_CODE_TITLE: "Подтвердите почту",
  REGISTER_CODE_SUBTITLE: (email) =>
    `Мы отправили 6-значный код на ${email}. Аккаунт будет создан только после подтверждения почты.`,
  REGISTER_CODE_LABEL: "Код из письма",
  REGISTER_CODE_PLACEHOLDER: "000000",
  REGISTER_CODE_REQUIRED: "Введите 6-значный код из письма",
  REGISTER_CODE_CONFIRM_BUTTON: "Подтвердить почту",
  REGISTER_CODE_RESEND_BUTTON: "Отправить код повторно",
  REGISTER_CODE_BACK_BUTTON: "Изменить данные регистрации",
  GUEST_PROFILE_ACTION_BUTTON: "Перейти",
  PROFILE_TITLE: "Профиль",
  SESSION_CHECK: "Проверка сессии…",
  SESSION_ERROR: "Ошибка сессии",
};

/** Модалка входа */
export const LOGIN_MODAL_UI = {
  ARIA_DIALOG: "Вход в аккаунт",
  ARIA_CLOSE_BACKDROP: "Закрыть окно входа",
  TITLE: "Вход",
  LABEL_EMAIL: "Email",
  LABEL_PASSWORD: "Пароль",
  SHOW_PASSWORD_ARIA: "Показать пароль",
  HIDE_PASSWORD_ARIA: "Скрыть пароль",
  SUBMIT_IDLE: "Войти",
  SUBMIT_LOADING: "Входим…",
  REGISTER_BUTTON: "Зарегистрироваться",
  SUCCESS: "Вы успешно вошли в аккаунт",
  ERROR_GENERIC: "Ошибка при входе",
  SESSION_VERIFY_FALLBACK:
    "Вход выполнен, но сессия не сохранилась. Обновите страницу и войдите снова.",
  PASSWORD_MIN_LENGTH: 6,
};

/** Модалка регистрации */
export const REGISTER_MODAL_UI = {
  ARIA_DIALOG: "Регистрация",
  ARIA_CLOSE_BACKDROP: "Закрыть окно регистрации",
  TITLE: "Регистрация",
  LABEL_EMAIL: "Email",
  LABEL_PASSWORD: "Пароль",
  LABEL_PASSWORD_CONFIRM: "Повторите пароль",
  SHOW_PASSWORD_ARIA: "Показать пароль",
  HIDE_PASSWORD_ARIA: "Скрыть пароль",
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT:
    "Только a–z и 0–9, без пробелов, 3–30 символов (как одно слово в нижнем регистре).",
  SUBMIT_IDLE: "Зарегистрироваться",
  SUBMIT_LOADING: "Регистрация…",
  ERROR_GENERIC: "Ошибка при регистрации",
  ERROR_REQUIRED_FIELDS: "Заполните обязательные поля",
  CODE_STEP_TEXT: (email) =>
    `Мы отправили 6-значный код на ${email}. Аккаунт будет создан только после подтверждения почты.`,
  CODE_STEP_EMAIL_FALLBACK: "ваш email",
  LABEL_CODE: "Код из письма",
  CODE_PLACEHOLDER: "000000",
  CODE_REQUIRED: "Введите 6-значный код из письма",
  CONFIRM_IDLE: "Подтвердить почту",
  CONFIRM_LOADING: "Проверка…",
  RESEND_BUTTON: "Отправить код повторно",
  RESEND_LOADING: "Отправка…",
  RESENT: "Письмо отправлено. Проверьте почту.",
  BACK_TO_FORM: "Изменить данные регистрации",
  ERROR_PASSWORD_MISMATCH: "Пароли не совпадают",
  ERROR_PASSWORD_TOO_SHORT: "Пароль должен быть не менее 6 символов",
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

/** Оценка пользователя `POST /vote/:targetUserId` */
export const USER_VOTE_RATING_UI = {
  COLLAPSE_SUMMARY: "Оценить пользователя",
  TITLE: "Оценка",
  CURRENT_AGGREGATE: "Сейчас в профиле",
  RANGE_LABEL: "Ваша оценка",
  SUBMIT: "Отправить оценку",
  SUBMIT_LOADING: "Отправка…",
  ALREADY_RATED: "Вы уже оценили пользователя",
  LOGIN_HINT: "Войдите, чтобы поставить оценку.",
  LOGIN_BUTTON: "Войти",
  SELF_HINT: "Нельзя оценить свой профиль.",
  ME_LOADING: "Загрузка…",
  MY_VOTE_RESOLVING: "Проверяем вашу оценку…",
  SUCCESS: "Оценка сохранена",
  SUCCESS_FLASH_MS: 2800,
};

/** Модалка карточки пользователя (продавец / общий шаблон) */
export const USER_DETAILS_MODAL_UI = {
  TITLE_LOADING: "Профиль: загрузка…",
  TITLE_FALLBACK: "Профиль пользователя",
  LOADING_BODY: "Загрузка данных…",
  CLOSE_TEXT: "Закрыть",
  ARIA_CLOSE: "Закрыть",
};

/** Страница чужого профиля (`/user/:id`) — паритет с mobile */
export const USER_DETAILS_PAGE_UI = {
  TITLE: "Профиль",
  BACK_ARIA: "Назад",
  LOADING: "Загрузка профиля…",
  FETCH_FALLBACK: "Не удалось загрузить профиль",
  SELF_REDIRECT_HINT: "Это ваш профиль",
  OPEN_OVERVIEW: "Мой обзор",
  RETRY: "Повторить",
};

/** Блок покупок в чужом профиле (авторизованный зритель). */
export const USER_PROFILE_PURCHASES_UI = {
  HEADING: "Список покупок",
  LOADING: "Загрузка покупок…",
  EMPTY: "Покупок нет",
  UNAVAILABLE: "Товар недоступен или удален",
};

/** Блок товаров продавца в чужом профиле (авторизованный зритель). */
export const USER_PROFILE_PRODUCTS_UI = {
  HEADING: "Список товаров",
  LOADING: "Загрузка товаров…",
  EMPTY: "Товаров нет",
  SHOW_MORE: "Показать ещё",
  SHOW_LESS: "Показать меньше",
  LOADING_MORE: "Загрузка…",
  UNAVAILABLE: "Товар недоступен или удален",
};

/** Раздел «Баллы» в профиле */
export const LOYALTY_POINTS_PAGE_UI = {
  PAGE_ARIA: "Баллы",
  LOGIN_HINT: "Войдите, чтобы посмотреть баллы.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить баллы",
  /** @param {number} balance */
  BALANCE_POINTS: (balance) => `Ваш баланс: ${balance} ${pluralizeRuBall(balance)}`,
  BALANCE_CAPTION: "Ваш баланс",
  INFO: "1 балл = 1 ₽. Продавец задаёт бонус за покупку; подтверждённый покупатель получает баллы после подтверждения получения.",
  USES_TITLE: "На что тратить баллы",
  PURCHASE_SECTION: "Пополнение",
  PURCHASE_AMOUNT_LABEL: "Сумма, ₽",
  PURCHASE_AMOUNT_HINT: "1 ₽ = 1 балл. Укажите, сколько хотите купить.",
  /** @param {number} points */
  PURCHASE_POINTS_PREVIEW: (points) => `Получите ${points} баллов`,
  PURCHASE_AMOUNT_MIN: (min) => `Минимум ${min} ₽`,
  PURCHASE_AMOUNT_MAX: (max) => `Не больше ${max} ₽`,
  BUY: "Купить",
  COMING_SOON: "Пополнение картой и по QR — скоро.",
  /** @param {number} rub @param {number} points */
  COMING_SOON_AMOUNT: (rub, points) =>
    `Пополнение на ${rub} ₽ (${points} баллов) картой и по QR — скоро.`,
  ADMIN_FREE_SECTION: "Бесплатное пополнение (admin)",
  ADMIN_FREE_AMOUNT_LABEL: "Сумма, баллы",
  ADMIN_FREE_AMOUNT_HINT: "Начислить на свой баланс без оплаты.",
  /** @param {number} min */
  ADMIN_FREE_AMOUNT_MIN: (min) => `Минимум ${min}`,
  /** @param {number} max */
  ADMIN_FREE_AMOUNT_MAX: (max) => `Не больше ${max}`,
  ADMIN_FREE_SUBMIT: "Начислить бесплатно",
  ADMIN_FREE_SUBMITTING: "Начисление…",
  /** @param {number} credited @param {number} balance */
  ADMIN_FREE_SUCCESS: (credited, balance) =>
    `Начислено ${credited}. Баланс: ${balance}`,
  USES: [
    "Оплата премиум-подписки",
    "Продвижение товаров в каталоге",
    "Реклама в intro",
    "Бонус за покупку у продавца (поле на товаре)",
  ],
};

/** Раздел «Партнёрская программа» в профиле */
export const PARTNER_PROGRAM_PAGE_UI = {
  ARIA: "Партнёрская программа",
  LOGIN_HINT: "Войдите, чтобы открыть партнёрскую программу.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить партнёрскую программу",
  BALANCE_CAPTION: "Партнёрский баланс",
  BALANCE_UNIT: "ед.",
  /** @param {number} percent */
  INFO: (percent) =>
    `${percent}% от трат приглашённых на услуги платформы. Конвертация в баллы 1:1.`,
  STATS_TITLE: "Сводка",
  STAT_REFERRALS: "Рефералы",
  STAT_SPEND: "Их траты",
  STAT_EARNED: "Ваш кэшбэк",
  INVITE_TITLE: "Ваша ссылка",
  INVITE_HINT: "Отправьте друзьям — кэшбэк начисляется с их трат на услуги платформы.",
  COPY_BUTTON: "Копировать",
  SHARE_BUTTON: "Поделиться",
  COPIED: "Ссылка скопирована",
  SHARED: "Готово",
  SHARE_COPIED: "Ссылка скопирована — вставьте в мессенджер",
  COPY_FAILED: "Не удалось скопировать",
  SHARE_FAILED: "Не удалось поделиться",
  CONVERT_SECTION: "Конвертация в баллы",
  CONVERT_LABEL: "Сумма",
  CONVERT_HINT: "1 партнёрская единица = 1 балл лояльности. Вывод наличными недоступен.",
  CONVERT_BUTTON: "Конвертировать",
  CONVERT_PENDING: "Конвертируем…",
  CONVERT_SUCCESS: "Готово: баланс конвертирован в баллы",
  CONVERT_ERROR: "Не удалось конвертировать",
  LIST_TITLE: "Ваши рефералы",
  LIST_EMPTY: "Пока никого нет — поделитесь ссылкой",
  COL_NAME: "Ник",
  COL_DATE: "Регистрация",
  COL_SPEND: "Траты",
  COL_CASHBACK: "Кэшбэк",
};

/** Раздел «Премиум» в профиле */
export const PREMIUM_PAGE_UI = {
  PAGE_ARIA: "Премиум",
  LOGIN_HINT: "Войдите, чтобы оформить премиум.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить премиум",
  PURCHASE_FALLBACK: "Не удалось оформить премиум",
  PLAN_TITLE: "Премиум",
  /** @param {number} price */
  PLAN_PRICE: (price) => `${price} баллов`,
  PLAN_PERIOD: "Срок: 1 календарный месяц",
  BENEFITS_TITLE: "Что входит",
  PLAN_BENEFITS: [
    "До 30 товаров в каталоге (вместо 15)",
    "Золотая обводка и галочка у имени",
    "Сторис и фон профиля по ссылке",
    "Товары в фильтре «Только премиум»",
    "Просмотр покупок других пользователей",
  ],
  /** @param {number} balance */
  BALANCE: (balance) => `Ваш баланс: ${balance} баллов`,
  ACTIVE: "Премиум уже активен. Продление будет доступно после окончания срока.",
  /** @param {number} required @param {number} balance */
  INSUFFICIENT_POINTS: (required, balance) =>
    `Недостаточно баллов: нужно ${required}, у вас ${balance}.`,
  SUBMIT: "Оформить премиум",
  SUBMIT_PENDING: "Оформляем…",
};

/** «Мой профиль» в шапке модалки и выход */
export const MY_PROFILE_PAGE_UI = {
  TAB_TITLE: "Мой профиль",
  TAB_OVERVIEW: "Обзор",
  NAV_ARIA: "Разделы профиля",
  NAV_SECTION_TRADE: "Торговля",
  NAV_SECTION_ACCOUNT: "Аккаунт",
  NAV_SECTION_STAFF: "Модерация",
  NAV_SECTION_MANAGEMENT: "Управление",
  TAB_CREATE_RAFFLE: "Создать розыгрыш",
  TAB_MY_PRODUCTS: "Мои товары",
  TAB_MY_SALES: "Мои продажи",
  TAB_MY_ORDERS: "Мои покупки",
  TAB_AUCTION: "Аукцион",
  /** @param {number} count */
  TAB_BADGE: (count) => (count > 99 ? "99+" : String(count)),
  TAB_ADMIN_ORDERS: "Все заказы",
  TAB_STAFF_AUDIT_LOG_ADMIN: "Журнал действий",
  TAB_SEARCH_SYNONYMS_ADMIN: "Синонимы поиска",
  TAB_POPULAR_PRODUCTS_ADMIN: "Популярные товары",
  TAB_CATEGORY_TREE_ADMIN: "Категории",
  TAB_APP_INTRO_ADMIN: "Intro-ролик",
  TAB_SITE_HEADER_BANNER_ADMIN: "Картинки",
  TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN: "Кнопки управления",
  TAB_PRODUCT_MODERATION: "На модерации",
  TAB_INTRO_AD_MODERATION: "Intro-реклама",
  TAB_SELLER_PERSONAL_CATEGORY_MODERATION: "Личные категории",
  TAB_PRODUCT_REPORTS: "Жалобы",
  TAB_PRODUCT_PROMOTIONS: "Продвижение",
  TAB_RAFFLES: "Розыгрыши",
  TAB_DATA_CONFIRMATION: "Подтверждение",
  TAB_INSTALLMENT_PAYMENTS: "Покупки - Рассрочка",
  TAB_INSTALLMENT_SALES: "Продажи - Рассрочка",
  TAB_INSTALLMENT_DISPUTES: "Споры",
  TAB_SUBSCRIPTIONS: "Подписки",
  TAB_WISHLIST: "Мои желания",
  DATA_CONFIRMATION: "Подтверждение данных",
  TAB_PREMIUM: "Премиум",
  TAB_LOYALTY_POINTS: "Баллы",
  TAB_PARTNER_PROGRAM: "Партнёрская программа",
  TAB_ADVERTISING: "Реклама",
  EDIT_PROFILE: "Изменить профиль",
  LOGOUT: "Выйти",
  LOGOUT_CONFIRM: "Вы точно хотите выйти?",
  LOGOUT_YES: "Да выйти",
  LOGOUT_CANCEL: "Отменить выход",
  MOBILE_NAV_TOGGLE_ARIA: "Открыть меню разделов профиля",
  MOBILE_NAV_CLOSE_ARIA: "Закрыть меню разделов",
  MOBILE_NAV_CURRENT_SECTION: "Раздел",
};

export const THEME_SETTINGS_UI = {
  LABEL: "Тема оформления",
  SYSTEM: "Системная",
  LIGHT: "Светлая",
  DARK: "Тёмная",
};

/** Редактирование своего профиля (`PATCH /user/:id`) — страница и админ-модалка */
export const EDIT_PROFILE_MODAL_UI = {
  ARIA_DIALOG: "Редактирование профиля",
  ARIA_CLOSE_BACKDROP: "Закрыть без сохранения",
  TITLE: "Редактирование профиля",
  HERO_INTRO: "Обновите оформление, контакты и данные профиля.",
  AUTH_REQUIRED: "Войдите, чтобы редактировать профиль",
  LOGIN_BUTTON: "Войти",
  SECTION_APPEARANCE: "Оформление",
  SECTION_ACCOUNT: "Аккаунт",
  SECTION_PERSONAL: "Личные данные",
  SECTION_NOTIFICATIONS: "Уведомления",
  SECTION_ABOUT: "О себе",
  SECTION_SOCIAL: "Соцсети",
  LABEL_EMAIL: "Email (нельзя изменить)",
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT:
    "Только a–z и 0–9, без пробелов, 3–30 символов. Пусто — не менять ник.",
  LABEL_PHONE: "Телефон",
  LABEL_BIRTH: "Дата рождения",
  LABEL_GENDER: "Пол",
  LABEL_ADDRESS: "Адрес",
  LABEL_REGION: "Регион просмотра",
  HINT_REGION:
    "Товары, баннеры и розыгрыши на главной показываются для этого региона. Адрес доставки — отдельно.",
  ERROR_REGION_REQUIRED: "Выберите регион",
  LABEL_AVATAR: "Аватар",
  LABEL_AVATAR_URL: "Аватар (ссылка или файл)",
  LABEL_BACKGROUND: "Фон профиля",
  LABEL_BG_PRESET: "Цвет фона",
  LABEL_BG_URL: "Фон — изображение (премиум, ссылка или файл)",
  LABEL_BG_PREVIEW: "Предпросмотр",
  LABEL_BG_URL_ADMIN: "Фон — изображение (приоритет над цветом, ссылка или файл)",
  BG_UPLOAD_BUTTON: "Загрузить фото фона",
  BG_REMOVE_IMAGE: "Убрать фото",
  UPLOAD_BUTTON: "Выбрать фото",
  UPLOAD_LOADING: "Загрузка…",
  UPLOAD_HINT: "JPEG, PNG или WebP, до 50 МБ — большие файлы сожмутся автоматически",
  UPLOAD_ERROR: "Не удалось загрузить файл",
  LABEL_NOTIFICATIONS: "Уведомления по email",
  LABEL_NOTES: "О себе",
  CLEAR_FIELD: "Очистить",
  CLEAR_SOCIAL_LINK: (label) => `Очистить ссылку ${label}`,
  WORDS_USED: (n, max) => `Слов: ${n} / ${max}`,
  CHARS_USED: (n, max) => `Символов: ${n} / ${max}`,
  PLACEHOLDER_HTTPS: "https://…",
  SUBMIT_IDLE: "Сохранить",
  SUBMIT_LOADING: "Сохранение…",
  SAVED: "Профиль сохранён",
  CANCEL: "Отмена",
};

export const PROFILE_IMAGE_FOCUS_EDITOR_UI = {
  HINT_AVATAR: "Кликните или перетащите картинку, чтобы выбрать область",
  HINT_BACKGROUND: "Кликните или перетащите картинку, чтобы выбрать область",
  HINT_RAFFLE_PRIZE: "Кликните или перетащите фото приза, чтобы выбрать область",
};

/** Подписи полей профиля в `dl` и форматирование */
export const USER_PROFILE_COPY = {
  LABELS: {
    _id: "ID",
    userName: "Никнейм",
    email: "Email",
    userBirthDate: "Дата рождения",
    userGender: "Пол",
    userAddress: "Адрес",
    userPhoneNumber: "Телефон",
    userLastLoginAt: "Последний вход",
    userAvatarUrl: "URL аватара",
    userBackgroundUrl: "Фон профиля",
    isActiveUser: "Активен",
    isUserDataConfirmed: "Пользователь подтверждён",
    isBlockedUser: "Заблокирован",
    userRole: "Роль",
    userDiscountPercent: "Скидка, %",
    notificationsEnabled: "Уведомления",
    isPremiumUser: "Премиум",
    notesAboutUser: "О себе",
    socialTelegramUrl: "Telegram",
    socialInstagramUrl: "Instagram",
    socialVkUrl: "VK",
    socialYoutubeUrl: "YouTube",
    socialWhatsappUrl: "WhatsApp",
    socialWebsiteUrl: "Сайт",
    userLoyaltyPoints: "Баллы лояльности",
    userRatingByVotes: "Рейтинг по голосам",
    followersCount: "Подписчики",
    followingCount: "Подписки",
    totalSalesCount: "Продаж",
    totalSalesAmount: "Продаж на сумму",
    totalPurchasesAmount: "Покупок на сумму",
    createdAt: "Создан",
    updatedAt: "Обновлён",
  },
  SHOW_PHONE_NUMBER: "Показать номер",
  RATING_NONE: "Нет оценок",
  BACKGROUND_CUSTOM_IMAGE: "Своё изображение",
  DATE_FORMAT_OPTIONS: { dateStyle: "short", timeStyle: "short" },
};

/** Общий каркас админ-вкладок в профиле */
export const ADMIN_PANEL_UI = {
  LOADING: "Загрузка…",
  REFRESH: "Обновить",
  SHOW_CREATE: "+ Добавить",
  HIDE_CREATE: "Скрыть форму",
  SEARCH_CLEAR: "Очистить поиск",
  SEARCH_PENDING: "Поиск…",
  /** @param {number} n */
  COUNT: (n) => `${n} записей`,
  /** @param {number} shown @param {number} total */
  COUNT_FILTERED: (shown, total) => `${shown} из ${total}`,
};

/** Компактная карточка в подборке на главной */
export const CURATED_PRODUCT_COMPACT_CARD_UI = {
  NO_IMAGE: "Нет фото",
  /** @param {string} [name] */
  OPEN_ARIA: (name) => `Открыть товар ${name ?? ""}`.trim(),
};

/** Админка: подборки товаров на главной */
export const POPULAR_PRODUCTS_ADMIN_PAGE_UI = {
  TITLE: "Популярные товары",
  HINT: "Списки с заголовком, регионом и productId. На главной подборка видна только в своём регионе; товары должны быть того же региона.",
  SEARCH_PLACEHOLDER: "Заголовок или productId…",
  LOAD_ERROR: "Не удалось загрузить списки",
  CREATE_ERROR: "Не удалось создать список",
  SAVE_ERROR: "Не удалось сохранить",
  DELETE_ERROR: "Не удалось удалить список",
  REORDER_ERROR: "Не удалось изменить порядок",
  ADD_ITEM_ERROR: "Не удалось добавить товар",
  REMOVE_ITEM_ERROR: "Не удалось удалить товар",
  EMPTY: "Списков нет — создайте первый",
  CREATE_HEADING: "Новый список",
  LIST_TITLE_LABEL: "Заголовок на главной",
  LIST_REGION_LABEL: "Регион показа",
  REGION_REQUIRED: "Укажите регион",
  TITLE_REQUIRED: "Укажите заголовок",
  CREATE_LIST: "Создать список",
  SAVE_TITLE: "Сохранить",
  PRODUCT_ID_LABEL: "productId",
  PRODUCT_ID_PLACEHOLDER: "MongoDB ObjectId товара",
  PRODUCT_ID_REQUIRED: "Укажите productId",
  ADD_PRODUCT: "Добавить товар",
  REMOVE_PRODUCT: "Удалить",
  DELETE_LIST: "Удалить список",
  DELETE_LIST_CONFIRM: "Удалить список и все товары в нём?",
  EMPTY_LIST: "В списке пока нет товаров",
  MOVE_UP_ARIA: "Поднять список",
  MOVE_DOWN_ARIA: "Опустить список",
};

/** Админка: журнал действий сотрудников (audit log) */
export const STAFF_AUDIT_LOG_ADMIN_PAGE_UI = {
  TITLE: "Журнал действий сотрудников",
  HINT: "Каждое действие модератора и админа (одобрение, отклонение, споры, удаление). Только чтение.",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить журнал аудита",
  EMPTY: "Записей пока нет",
  EMPTY_FILTER: "По фильтру ничего не найдено",
  REFRESH: "Обновить",
  FILTER_ACTION_PLACEHOLDER: "Действие (напр. approve)…",
  FILTER_FROM: "С даты",
  FILTER_TO: "По дату",
  APPLY: "Применить",
  RESET: "Сбросить",
  FILTER_BY_ACTOR: "Только этот сотрудник",
  CLEAR_ACTOR: "Показать всех",
  COL_TIME: "Время",
  COL_ACTOR: "Сотрудник",
  COL_ACTION: "Действие",
  COL_STATUS: "Статус",
  DETAILS: "Детали",
  DETAILS_PATH: "Путь",
  DETAILS_PARAMS: "Параметры",
  DETAILS_BODY: "Тело запроса",
  DETAILS_REQUEST_ID: "Request ID",
  UNKNOWN_ACTOR: "—",
  COUNT: (total) => `Всего записей: ${total}`,
  PAGE_LABEL: (page, pages) => `Стр. ${page} из ${pages}`,
  PREV: "Назад",
  NEXT: "Вперёд",
};

/** Админка: синонимы умного поиска */
export const SEARCH_SYNONYMS_ADMIN_PAGE_UI = {
  TITLE: "Синонимы поиска",
  HINT: "Токен в запросе расширяет выдачу по legacy-категориям. Изменения в каталоге — сразу после сохранения.",
  SEARCH_PLACEHOLDER: "Токен или категория…",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить синонимы",
  SAVE_ERROR: "Не удалось сохранить",
  DELETE_ERROR: "Не удалось удалить",
  EMPTY: "Синонимов нет",
  EMPTY_FILTER: "Ничего не найдено",
  CREATE_HEADING: "Новый синоним",
  LABEL_TOKEN: "Токен запроса",
  LABEL_CATEGORIES: "Категории",
  CATEGORIES_HINT: "Выберите одну или несколько",
  CREATE_BUTTON: "Добавить",
  COL_TOKEN: "Токен",
  COL_CATEGORIES: "Категории",
  COL_ACTIONS: "Действия",
  EDIT_BUTTON: "Изменить",
  SAVE_BUTTON: "Сохранить",
  CANCEL_BUTTON: "Отмена",
  DELETE_BUTTON: "Удалить",
  DELETE_CONFIRM: "Удалить синоним?",
};

/** Админка: дерево ProductCategory */
export const CATEGORY_TREE_ADMIN_PAGE_UI = {
  TITLE: "Дерево категорий",
  HINT: "Корневые категории — плитки на главной каталога. Подкатегории — визард при размещении товара.",
  SEARCH_PLACEHOLDER: "Название, slug, ключевые слова…",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить категории",
  SAVE_ERROR: "Не удалось сохранить",
  DELETE_ERROR: "Не удалось удалить",
  EMPTY: "Категорий нет — миграция дерева или новый узел",
  EMPTY_FILTER: "Ничего не найдено",
  CREATE_HEADING: "Новая категория",
  LABEL_SLUG: "Slug",
  SLUG_HINT: "Только a–z, 0–9 и дефис. Пример: electronics-headphones. Не кириллица.",
  SLUG_INVALID: "Slug: только латиница, цифры и дефис (минимум 2 символа)",
  LABEL_NAME: "Название (RU)",
  LABEL_PARENT: "Родитель",
  PARENT_ROOT: "Корень",
  LABEL_LEAF: "Конечная (лист)",
  LABEL_KEYWORDS: "Ключевые слова поиска",
  KEYWORDS_PLACEHOLDER: "телефон, смартфон",
  LABEL_DEFAULT_CHARACTERISTICS: "Характеристики по умолчанию",
  DEFAULT_CHARACTERISTICS_HINT:
    "По одной на строку. Подставляются продавцу при создании товара (можно удалить). Макс. 10.",
  DEFAULT_CHARACTERISTICS_PLACEHOLDER: "Состояние\nЦвет\nПамять\nОЗУ",
  LABEL_LEGACY: "Legacy productCategory",
  LEGACY_NONE: "—",
  CREATE_BUTTON: "Создать",
  COL_PATH: "Путь",
  COL_SLUG: "Slug",
  COL_KEYWORDS: "Ключевые слова",
  COL_LEAF: "Лист",
  COL_ACTIONS: "Действия",
  YES: "Да",
  NO: "Нет",
  LEAF_BADGE: "Лист",
  BRANCH_BADGE: "Ветка",
  EDIT_BUTTON: "Изменить",
  SAVE_BUTTON: "Сохранить",
  CANCEL_BUTTON: "Отмена",
  DELETE_BUTTON: "Удалить",
  DELETE_CONFIRM:
    "Удалить категорию вместе со всеми подкатегориями? В ветке не должно быть товаров.",
  DELETE_REASSIGN_CONFIRM:
    "{message}\n\nПереназначить товары на «{targetLabel}» и удалить?",
  DELETE_DETACH_CONFIRM:
    "{message}\n\nОтвязать товары от подкатегории (останется «{legacyLabel}») и удалить?",
};

/** Админ: настройка intro-ролика в профиле */
export const APP_INTRO_ADMIN_PAGE_UI = {
  TITLE: "Intro-ролик",
  HINT: "Заставка при первом заходе на сайт. Без своего видео используется файл /intro/intro.mp4 из репозитория.",
  LOADING: "Загрузка настроек…",
  LOAD_ERROR: "Не удалось загрузить настройки intro",
  SAVE_ERROR: "Не удалось сохранить настройки intro",
  SAVE_SUCCESS: "Сохранено",
  WATCH_AFTER_SAVE: "Посмотреть intro",
  PREVIEW: "Предпросмотр",
  SAVE: "Сохранить",
  SAVING: "Сохранение…",
  SECTION_MEDIA: "Видео и постер",
  SECTION_FALLBACK: "Заглушка при ошибке видео",
  SECTION_TIMING: "Тайминги",
  LABEL_VIDEO: "Видео",
  HINT_VIDEO:
    "MP4, WebM, MOV или HEVC — сервер конвертирует в MP4. Пустое поле — дефолтный /intro/intro.mp4",
  LABEL_POSTER: "Постер",
  LABEL_FALLBACK_TITLE: "Заголовок заглушки",
  LABEL_FALLBACK_HINT: "Подзаголовок заглушки",
  LABEL_MIN_MS: "Минимум показа, мс",
  LABEL_MAX_MS: "Максимум показа, мс",
  LABEL_FADE_MS: "Fade-out, мс",
  ERROR_FALLBACK_TITLE_REQUIRED: "Укажите заголовок заглушки",
  ERROR_FALLBACK_TITLE_TOO_LONG: "Заголовок заглушки слишком длинный",
  ERROR_FALLBACK_HINT_REQUIRED: "Укажите подзаголовок заглушки",
  ERROR_FALLBACK_HINT_TOO_LONG: "Подзаголовок заглушки слишком длинный",
  ERROR_MIN_MS: "Минимум показа вне допустимого диапазона",
  ERROR_MAX_MS: "Максимум показа вне допустимого диапазона",
  ERROR_MAX_LT_MIN: "Максимум не может быть меньше минимума",
  ERROR_FADE_MS: "Fade-out вне допустимого диапазона",
  SECTION_PRIORITY: "Приоритет показа",
  LABEL_PRIORITIZE_PLATFORM_INTRO: "Показывать intro платформы вместо рекламы",
  HINT_PRIORITIZE_PLATFORM_INTRO:
    "Если включено — платформенный intro имеет приоритет, оплаченные кампании ставятся на паузу.",
};

export const SITE_HEADER_BANNER_ADMIN_PAGE_UI = {
  TITLE: "Картинки",
  HINT: "Карусель под строкой поиска на главном каталоге. Только изображение и alt-текст.",
  LOADING: "Загрузка настроек…",
  LOAD_ERROR: "Не удалось загрузить настройки баннера",
  SAVE_ERROR: "Не удалось сохранить настройки баннера",
  SAVE_SUCCESS: "Сохранено",
  SAVE: "Сохранить",
  SAVING: "Сохранение…",
  TABS_ARIA: "Разделы баннера шапки",
  TAB_SLIDES: "Слайды",
  TAB_BUTTONS: "Кнопки",
  TAB_GUEST: "Профиль гостя",
  SECTION_GLOBAL: "Общие настройки",
  SECTION_ITEMS: "Слайды",
  LABEL_ENABLED: "Показывать баннеры на главной",
  LABEL_GUEST_PROFILE_LOGIN_MENU_BANNER_IMAGE: "Картинка меню профиля (вход)",
  HINT_GUEST_PROFILE:
    "Показывается гостю на экране профиля над кнопками входа и регистрации.",
  LABEL_ITEM_ENABLED: "Слайд включён",
  LABEL_IMAGE: "Изображение",
  HINT_IMAGE: "Рекомендуемая высота ~120px, ширина на всю шапку",
  LABEL_IMAGE_ALT: "Alt-текст",
  LABEL_LINK_PATH: "Внутренний путь",
  LINK_PATH_PLACEHOLDER: "/product/…",
  HINT_LINK_PATH: "Путь внутри сайта, начинается с /. Пусто — без перехода.",
  LABEL_BACKGROUND_COLOR: "Цвет фона",
  ADD_ITEM: "Добавить слайд",
  REMOVE_ITEM: "Удалить слайд",
  EMPTY_ITEMS: "Слайдов пока нет.",
  /** @param {number} index */
  ITEM_TITLE: (index) => `Слайд ${index}`,
  SECTION_PREVIEW: "Превью",
  HINT_PREVIEW: "Как карусель выглядит на главной при текущих настройках.",
  PREVIEW_EMPTY: "Включите баннер и добавьте изображения, чтобы увидеть превью.",
  SELECT_SLIDE_HINT: "Выберите слайд слева для редактирования.",
  NO_SLIDE_SELECTED: "Слайд не выбран.",
  ITEM_DISABLED_BADGE: "выкл.",
  CLEAR_COLOR: "Сбросить цвет",
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

/**
 * @param {number} avg
 * @param {number} countVotes
 * @param {number} totalRating
 */
export function formatUserProfileRatingLine(avg, countVotes, totalRating) {
  return `среднее ${avg.toFixed(1)} · голосов ${countVotes} · сумма ${totalRating}`;
}

/**
 * @param {{ countVotes?: number; totalRating?: number } | null | undefined} raw
 * @returns {string}
 */
export function formatUserProfileRatingValue(raw) {
  if (!raw || typeof raw !== "object") {
    return "0";
  }

  const countVotes = Number(raw.countVotes) || 0;
  const totalRating = Number(raw.totalRating) || 0;

  if (countVotes === 0) {
    return "0";
  }

  const avg = totalRating / countVotes;
  const rounded = Math.round(avg * 10) / 10;

  return String(rounded);
}

/**
 * @param {{ countVotes?: number } | null | undefined} raw
 * @returns {string}
 */
export function formatUserProfileRatingVotesLabel(raw) {
  if (!raw || typeof raw !== "object") {
    return "голосов 0";
  }

  const countVotes = Number(raw.countVotes) || 0;

  return `голосов ${countVotes}`;
}
