/**
 * Статичные подписи интерфейса и числа, сгруппированные по темам (главная, профиль, API…).
 * Не хранит динамические ответы сервера — только дефолты и шаблоны.
 */

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
  UPLOAD_HINT: "JPEG, PNG или WebP, до 5 МБ. Можно также вставить ссылку.",
  UPLOAD_DISABLED_HINT: "Загрузка файла доступна после входа в аккаунт",
  ERROR_TYPE: "Допустимы только JPEG, PNG и WebP",
  ERROR_SIZE: "Файл не больше 5 МБ",
  ERROR_GENERIC: "Не удалось загрузить файл",
  ERROR_AUTH: "Войдите в аккаунт, чтобы загрузить файл",
  FILE_INPUT_ARIA: "Выбрать изображение с устройства",
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
  FETCH_DATA_CONFIRMATION_STATUS_FALLBACK:
    "Не удалось загрузить статус заявки",
  FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK: "Не удалось загрузить заявки",
  FETCH_DATA_CONFIRMATION_COUNT_FALLBACK:
    "Не удалось загрузить счётчик заявок",
  RESOLVE_DATA_CONFIRMATION_FALLBACK: "Не удалось рассмотреть заявку",
  SUBMIT_PRICE_OFFER_FALLBACK: "Не удалось отправить предложение цены",
  FETCH_PRICE_OFFER_FALLBACK: "Не удалось загрузить предложение цены",
  FETCH_PRICE_OFFERS_TOP_FALLBACK: "Не удалось загрузить ставки",
  FETCH_SELLER_PRICE_OFFERS_FALLBACK: "Не удалось загрузить аукцион",
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
  PATCH_RAFFLE_FALLBACK: "Не удалось сохранить розыгрыш",
  DELETE_RAFFLE_FALLBACK: "Не удалось удалить розыгрыш",
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
  RATING_LINE: "★ {rating} · {count} отзывов",
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
  LABEL_PRICE: "Ваша цена, ₽",
  SUBMIT: "Предложить цену",
  UPDATE: "Изменить цену",
  CANCEL: "Отменить предложение",
  SUBMIT_LOADING: "Отправка…",
  STATUS_PENDING: "Ожидает решения продавца",
  STATUS_ACCEPTED: "Принято — оформите оплату",
  STATUS_REJECTED: "Отклонено",
  PAY_BUTTON: "Оплатить по принятой цене",
  PAY_ORDER_PLACED: "Заказ по принятой цене оформлен",
  PAY_MODAL_TITLE: "Оплата по ставке",
  CONFIRMED_DATA_REQUIRED:
    "Доступно только пользователям с подтверждёнными данными",
  EMPTY_TOP: "Ставок пока нет",
  SELLER_EMPTY: "Предложений пока нет",
  SELLER_LOADING: "Загрузка…",
  AUCTION_NOT_HELD: "Аукцион не проводится",
  AUCTION_ENDED: "Аукцион завершён",
  ARCHIVE_SECTION_TITLE: "История ставок",
  ARCHIVE_EMPTY: "Архив пуст",
  ACTION_ACCEPT: "Принять",
  ACTION_REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  ACCEPTED_BADGE: "Ожидает оплаты",
};

/** Поиск пользователей (`GET /user/search`) */
export const USER_SEARCH_UI = {
  API_PAGE_LIMIT: 100,
  DEBOUNCE_MS: 350,
};

/** Поле поиска пользователей */
export const USER_SEARCH_INPUT_UI = {
  PLACEHOLDER: "Поиск по нику, телефону или email…",
  ARIA_LABEL: "Поиск пользователей",
  CLEAR_ARIA: "Очистить поле поиска",
  PENDING_ARIA: "Идёт поиск",
};

/** Поиск товаров (`GET /product` и `GET /product/my`) */
export const PRODUCT_SEARCH_UI = {
  DEBOUNCE_MS: 350,
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
  BREADCRUMB_HOME: "Главная",
  NAV_TO_HOME: "Главная",
  BREADCRUMB_MY_PROFILE: "Мой профиль",
  BREADCRUMB_MY_PRODUCTS: "Мои товары",
  BREADCRUMB_SEPARATOR: " > ",
  ARIA_MY_PRODUCTS_CRUMB: "Мой профиль, Мои товары",
  TITLE_USERS: "Пользователи",
  TITLE_CART: "Корзина",
  TITLE_MY_ORDERS: "Мои покупки",
  TITLE_MY_SALES: "Мои продажи",
  TITLE_ADMIN_ORDERS: "Все заказы",
  TITLE_PRODUCT_MODERATION: "На модерации",
  TITLE_PRODUCT_REPORTS: "Жалобы",
  TITLE_DATA_CONFIRMATION: "Подтверждение данных",
  NAV_TO_CATALOG: "← Каталог товаров",
  NAV_AUTH_ARIA: "Действия аккаунта",
  NAV_SECTIONS_ARIA: "Навигация по разделам",
  NAV_TO_USERS: "Пользователи",
  NAV_TO_SUBSCRIPTIONS: "Подписки",
  TITLE_SUBSCRIPTIONS: "Подписки",
  TITLE_NOTIFICATIONS: "Уведомления",
  FILTER_FOLLOWING_ONLY: "Только от подписок",
  FILTER_AUCTION_ONLY: "Только с аукционом",
  EMPTY_FOLLOWING_FILTER: "Нет товаров от ваших подписок с текущими фильтрами.",
  LOGIN_FOR_FOLLOWING_FILTER: "Войдите, чтобы включить фильтр «только от подписок».",
  NAV_TO_CART: "Корзина",
  NAV_TO_MY_ORDERS: "Мои покупки",
  NAV_TO_ADMIN_ORDERS: "Все заказы",
  FILTER_BUTTON_ARIA: "Фильтр по категории",
  FILTER_BUTTON_ARIA_SELECTED: (categoryLabel) =>
    `Фильтр по категории: ${categoryLabel}`,
  SORT_LABEL: "Сортировка",
  MODERATION_STATUS_FILTER_LABEL: "Статус",
  SHOW_HIDDEN_PRODUCTS: "Показывать скрытые товары",
  CATEGORY_ALL: "Все категории",
  SUBTITLE_MY_ONLY: "Показаны только ваши товары.",
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
};

/** Кнопка добавления товара в корзину */
export const ADD_TO_CART_UI = {
  ADD: "В корзину",
  LOGIN_TO_ADD: "Войти, чтобы добавить",
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

/** Страница «Корзина» */
export const CART_PAGE_UI = {
  TITLE: "Корзина",
  EMPTY: "Корзина пуста.",
  LOADING: "Загрузка корзины…",
  TOTAL_LABEL: "Итого",
  REMOVE_LINE_ARIA: "Удалить из корзины",
  CLEAR_ALL: "Очистить корзину",
  GO_TO_CATALOG: "Перейти в каталог",
  AUTH_REQUIRED: "Войдите, чтобы оформить заказ.",
  AUTH_LOGIN: "Войти",
  PRODUCT_DELETED_OR_HIDDEN: "Товар недоступен",
};

/** DaData: адрес до дома + квартира */
export const ADDRESS_DELIVERY_UI = {
  LABEL_LINE: "Адрес (город, улица, дом)",
  LABEL_FLAT: "Квартира / офис",
  PLACEHOLDER_LINE: "Начните вводить и выберите из списка",
  PLACEHOLDER_FLAT: "12",
  HINT_LINE: "Выберите вариант из подсказок DaData",
  HINT_FLAT: "Обязательно для доставки",
  SUGGEST_LOADING: "Ищем адреса…",
  SUGGEST_ERROR: "Подсказки недоступны",
};

/** Форма оформления заказа */
export const CHECKOUT_FORM_UI = {
  HEADING: "Оформление заказа",
  LABEL_DELIVERY_ADDRESS: "Адрес доставки",
  PLACEHOLDER_DELIVERY_ADDRESS: "Город, улица, дом, квартира",
  LABEL_PAYMENT_METHOD: "Способ оплаты",
  SUBMIT_IDLE: "Оформить заказ",
  SUBMIT_LOADING: "Оформляем…",
  SUCCESS: "Заказ успешно оформлен",
  ERROR_GENERIC: "Не удалось оформить заказ",
  ADDRESS_MAX_LENGTH: 30,
};

/** Подписи карточки заказа (используется на Мои покупки и Все заказы) */
export const ORDER_CARD_UI = {
  ITEMS_HEADING: "Позиции",
  TOTAL_LABEL: "Итого",
  ADDRESS_LABEL: "Адрес доставки",
  PAYMENT_LABEL: "Оплата",
  STATUS_LABEL: "Статус",
  ITEM_STATUS_LABEL: "Статус позиции",
  ITEM_DELIVERED_AT_LABEL: "Доставлен",
  ITEM_CONFIRMED_AT_LABEL: "Подтверждён",
  CREATED_LABEL: "Создан",
  BUYER_LABEL: "Покупатель",
  ACTION_SHIPPED: "Отправлен",
  ACTION_DELIVERED: "Доставлен",
  ACTION_CONFIRM: "Подтвердить",
  ACTION_PENDING: "Сохраняем…",
  DELETED_PRODUCT_NAME: "Товар удалён",
};

/** Страница «Мои покупки» */
export const MY_ORDERS_PAGE_UI = {
  TITLE: "Мои покупки",
  LOADING: "Загрузка покупок…",
  PRODUCT_DETAILS_LOADING: "Открываем карточку товара…",
  EMPTY: "У вас пока нет покупок.",
  /** @param {number} points */
  LOYALTY_POINTS_EARNED: (points) => `+${points} баллов лояльности`,
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
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Жалобы на товары (staff) */
export const PRODUCT_REPORTS_PAGE_UI = {
  LOADING: "Загрузка жалоб…",
  EMPTY: "Нет необработанных жалоб.",
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

/** Заявки на подтверждение данных (staff) */
export const DATA_CONFIRMATION_PAGE_UI = {
  LOADING: "Загрузка заявок…",
  EMPTY: "Нет заявок на рассмотрении.",
  SUBMITTED_LABEL: "Подана",
  OPEN_APPLICANT: "Профиль заявителя",
  PASSPORT_SECTION: "Паспортные данные",
  STAFF_NOTE_LABEL: "Комментарий при отклонении",
  STAFF_NOTE_PLACEHOLDER: "Не меньше 3 слов…",
  STAFF_NOTE_MIN_WORDS: 3,
  ACTION_APPROVE: "Подтвердить",
  ACTION_REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  /** @param {number} n */
  TAB_BADGE: (n) => (n > 99 ? "99+" : String(n)),
};

/** Подача заявки на подтверждение данных */
export const DATA_CONFIRMATION_MODAL_UI = {
  ARIA_DIALOG: "Подтверждение данных",
  TITLE: "Подтверждение данных",
  INTRO:
    "Заполните паспортные данные. После проверки модератором у вас появится значок подтверждённого продавца.",
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
  ALREADY_REPORTED: "Вы уже жаловались",
  SUCCESS: "Жалоба принята",
  REPORT_BUTTON: "Пожаловаться",
  WORDS_USED: (current, max) => `${current} / ${max} слов`,
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

export const SUBSCRIPTIONS_PAGE_UI = {
  LOADING: "Загрузка подписок…",
  EMPTY: "Вы ни на кого не подписаны. Найдите продавцов в разделе «Пользователи».",
  FETCH_FALLBACK: "Не удалось загрузить подписки",
  LOGIN_HINT: "Войдите, чтобы видеть список подписок.",
  LOGIN_BUTTON: "Войти",
};

/** Страница «Мои продажи» */
export const MY_SALES_PAGE_UI = {
  TITLE: "Мои продажи",
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
};

/** Админ: редактирование чужого профиля */
export const ADMIN_EDIT_USER_UI = {
  TITLE: "Редактирование пользователя",
  SECTION_ADMIN: "Администрирование",
  LABEL_ROLE: "Роль",
  LABEL_DISCOUNT: "Скидка, %",
  LABEL_PREMIUM: "Премиум",
  LABEL_ACCOUNT_ACTIVE: "Учётка активна",
  LABEL_BLOCKED: "Заблокирован",
  LABEL_USER_DATA_CONFIRMED: "Данные подтверждены",
  EDIT_BUTTON: "Редактировать",
  DELETE_BUTTON: "Удалить пользователя",
  DELETE_CONFIRM_TITLE: "Удалить пользователя?",
  DELETE_CONFIRM_HINT: (token) =>
    `Введите «${token}» для подтверждения`,
  DELETE_CONFIRM_PLACEHOLDER: "Подтверждение",
  DELETE_SUBMIT: "Удалить",
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
  TOTAL_SALES_LABEL: "Продаж на сумму",
  TOTAL_PURCHASES_LABEL: "Покупок на сумму",
  RATING_LABEL: "Рейтинг",
  USER_DATA_CONFIRMED_LABEL: "Пользователь подтверждён",
  FOLLOWERS_LABEL: "Подписчики",
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

/** Модалка создания товара (`POST /product`) */
export const CREATE_PRODUCT_MODAL_UI = {
  ARIA_DIALOG: "Создание товара",
  ARIA_DIALOG_EDIT: "Редактирование товара",
  ARIA_CLOSE_BACKDROP: "Закрыть окно создания товара",
  ARIA_CLOSE_BACKDROP_EDIT: "Закрыть окно редактирования товара",
  TITLE: "Новый товар",
  TITLE_EDIT: "Редактирование товара",
  LABEL_NAME: "Название",
  LABEL_DESCRIPTION: "Описание (до 100 слов)",
  LABEL_IMAGE_URLS:
    "Изображения (необязательно, до 5 — ссылка или файл)",
  IMAGE_ORDER_HINT: "Перетащите за ⋮⋮ — порядок в каталоге (1 — главное фото).",
  DRAG_HANDLE_ARIA: "Перетащить для смены порядка",
  ADD_IMAGE_ROW: "Добавить ещё фото",
  REMOVE_IMAGE_ROW_ARIA: "Удалить поле ссылки на изображение",
  IMAGE_ROW_ARIA_PREFIX: "Ссылка на изображение",
  LABEL_PRICE: "Цена",
  LABEL_CATEGORY: "Категория",
  LABEL_AVAILABLE: "Товар в наличии",
  LABEL_STOCK_QUANTITY: "Количество в наличии (шт.)",
  ERROR_STOCK: "Укажите количество от 1 до 9999",
  MANAGE_SECTION_TITLE: "Управление товаром",
  MANAGE_SECTION_ARIA: "Дополнительные действия с товаром",
  LABEL_AUCTION: "Проводить аукцион (предложения цены)",
  SUBMIT_IDLE: "Создать",
  SUBMIT_LOADING: "Создаём…",
  SUBMIT_EDIT_IDLE: "Сохранить",
  SUBMIT_EDIT_LOADING: "Сохраняем…",
  ERROR_PRICE: "Укажите корректную цену (число ≥ 0)",
  ERROR_GENERIC: "Не удалось создать товар",
  ERROR_EDIT_GENERIC: "Не удалось сохранить изменения",
};

/** Модалка карточки товара в каталоге */
export const PRODUCT_DETAILS_MODAL_UI = {
  GALLERY_THUMBS_ARIA: "Дополнительные фотографии товара",
  OPEN_GALLERY_FULLSCREEN: "Просмотреть все фото в полном экране",
  SLIDER_REGION_ARIA: "Слайдер фотографий товара",
  DETAILS_SECTION_ARIA: "Описание и служебная информация о товаре",
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
  AVAILABILITY_STATUS_VISIBLE: "В каталоге для всех",
  AVAILABILITY_STATUS_HIDDEN: "Скрыт от покупателей",
  HIDE_FROM_CATALOG: "Скрыть от покупателей",
  SHOW_IN_CATALOG: "Показать в каталоге",
  AVAILABILITY_TOGGLE_PENDING: "Обновление…",
  MANAGE_PRODUCT_TOGGLE: "Редактировать",
  MANAGE_PRODUCT_COLLAPSE: "Свернуть",
  EDIT_PRODUCT: "Изменить",
  PROMOTION_BUTTON: "Продвигать",
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
  /** @param {string} until */
  PROMOTED_UNTIL: (until) => `В продвижении до ${until}`,
  PROMOTION_PENDING_BADGE: "Ожидает подтверждения staff",
  RAFFLE_BADGE: "Розыгрыш",
  AUCTION_BADGE: "Аукцион",
  RAFFLE_PARTICIPATION_ON: "Участвует в розыгрыше",
  RAFFLE_PARTICIPATION_OFF: "Добавить в розыгрыш",
  RAFFLE_PARTICIPATION_PENDING: "Сохраняем…",
  AUCTION_STATUS_ON: "Проводится аукцион (предложения цены)",
  AUCTION_STATUS_OFF: "Аукцион не проводится",
  AUCTION_TOGGLE_ON: "Проводить аукцион (предложения цены)",
  AUCTION_TOGGLE_OFF: "Выключить аукцион",
  AUCTION_TOGGLE_PENDING: "Обновление…",
};

export const CREATE_RAFFLE_MODAL_UI = {
  ARIA_DIALOG: "Создание розыгрыша",
  ARIA_DIALOG_EDIT: "Редактирование розыгрыша",
  ARIA_CLOSE: "Закрыть",
  TITLE: "Создать розыгрыш",
  TITLE_EDIT: "Изменить розыгрыш",
  LABEL_TITLE: "Название",
  LABEL_DESCRIPTION: "Описание",
  LABEL_PRIZE_IMAGE: "Фото приза (ссылка или файл)",
  LABEL_TARGET: "Цель продаж",
  LABEL_INSTAGRAM: "Ссылка Instagram",
  SUBMIT: "Отправить на модерацию",
  SUBMIT_EDIT: "Сохранить",
  SUBMIT_LOADING: "Отправляем…",
  SUBMIT_EDIT_LOADING: "Сохраняем…",
  HINT: "После одобрения staff включите участие на своих товарах в «Мои товары».",
  HINT_EDIT_ACTIVE:
    "Изменения цели продаж пересчитают прогресс для активного розыгрыша.",
};

export const RAFFLE_FEATURED_CAROUSEL_UI = {
  PREV: "Предыдущий розыгрыш",
  NEXT: "Следующий розыгрыш",
  /** @param {number} index @param {number} total */
  SLIDE_ARIA: (index, total) => `Слайд ${index} из ${total}`,
  AUTOPLAY_MS: 6000,
};

export const RAFFLE_FEATURED_BANNER_UI = {
  BADGE: "Розыгрыш",
  /** @param {number} progress @param {number} target */
  PROGRESS: (progress, target) => `${progress} / ${target} продаж`,
  REMAINING: (left) => `Осталось ${left}`,
  COMPLETED: "Завершён",
  OPEN_PRODUCTS: "Товары розыгрыша",
  OPEN_INSTAGRAM: "Итоги в Instagram",
  DESCRIPTION_MODAL_TITLE: "Описание",
  DESCRIPTION_OPEN_ARIA: "Открыть полное описание розыгрыша",
  CLOSE: "Закрыть",
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
  DELETE_CONFIRM:
    "Удалить розыгрыш? Участие товаров будет снято, восстановить нельзя.",
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

export const RAFFLE_PRODUCTS_PAGE_UI = {
  TITLE: "Товары розыгрыша",
  LOADING: "Загрузка…",
  EMPTY: "Нет товаров в этом розыгрыше.",
  BACK_CATALOG: "В каталог",
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
  ROW_PRICE: "Сумма",
};

export const PRODUCT_PROMOTION_UI = {
  MODAL_TITLE: "Продвижение товара",
  MODAL_SUBTITLE: (productName) => `Товар: ${productName || "Без названия"}`,
  PAYMENT_PLACEHOLDER: "Оплата подключится позже, заявка отправится staff-команде.",
  TARIFF_LABEL: "Пакет продвижения",
  TARIFF_OPTION: (title, priceRub) => `${title} — ${priceRub} ₽`,
  TARIFF_DURATION: (durationHours) => `Срок действия: ${durationHours} ч.`,
  SUBMIT: "Отправить на подтверждение",
  SUBMIT_PENDING: "Отправка…",
  CANCEL: "Отмена",
  CLOSE: "Закрыть",
};

/** Модалка входа */
export const LOGIN_MODAL_UI = {
  ARIA_DIALOG: "Вход в аккаунт",
  ARIA_CLOSE_BACKDROP: "Закрыть окно входа",
  TITLE: "Вход",
  LABEL_EMAIL: "Email",
  LABEL_PASSWORD: "Пароль",
  SUBMIT_IDLE: "Войти",
  SUBMIT_LOADING: "Входим…",
  REGISTER_BUTTON: "Зарегистрироваться",
  SUCCESS: "Вы успешно вошли в аккаунт",
  ERROR_GENERIC: "Ошибка при входе",
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
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT:
    "Только a–z и 0–9, без пробелов, 3–30 символов (как одно слово в нижнем регистре).",
  LABEL_PHONE: "Телефон (phoneNumber → userPhoneNumber)",
  LABEL_BIRTH: "Дата рождения (userBirthDate)",
  LABEL_GENDER: "Пол (userGender)",
  LABEL_ADDRESS: "Адрес (userAddress)",
  LABEL_AVATAR_URL: "Аватар (ссылка или файл)",
  LABEL_BG_PRESET: "Цвет фона профиля",
  LABEL_BG_PREVIEW: "Предпросмотр фона",
  LABEL_NOTIFICATIONS: "Уведомления (notificationsEnabled)",
  PLACEHOLDER_HTTPS: "https://…",
  SUBMIT_IDLE: "Зарегистрироваться",
  SUBMIT_LOADING: "Регистрация…",
  SUCCESS: "Регистрация прошла успешно",
  ERROR_GENERIC: "Ошибка при регистрации",
  ERROR_REQUIRED_FIELDS: "Заполните обязательные поля",
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
  TITLE_WITH_NAME_PREFIX: "Профиль: ",
  LOADING_BODY: "Загрузка данных…",
  CLOSE_TEXT: "Закрыть",
  ARIA_CLOSE: "Закрыть",
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

/** «Мой профиль» в шапке модалки и выход */
export const MY_PROFILE_PAGE_UI = {
  TAB_TITLE: "Мой профиль",
  TAB_CREATE_RAFFLE: "Создать розыгрыш",
  TAB_MY_PRODUCTS: "Мои товары",
  TAB_MY_SALES: "Мои продажи",
  TAB_MY_ORDERS: "Мои покупки",
  TAB_ADMIN_ORDERS: "Все заказы",
  TAB_PRODUCT_MODERATION: "На модерации",
  TAB_PRODUCT_REPORTS: "Жалобы",
  TAB_PRODUCT_PROMOTIONS: "Продвижение",
  TAB_RAFFLES: "Розыгрыши",
  TAB_DATA_CONFIRMATION: "Подтверждение",
  TAB_SUBSCRIPTIONS: "Подписки",
  DATA_CONFIRMATION: "Подтверждение данных",
  EDIT_PROFILE: "Изменить профиль",
  LOGOUT: "Выйти",
  LOGOUT_CONFIRM: "Вы точно хотите выйти?",
  LOGOUT_YES: "Да выйти",
  LOGOUT_CANCEL: "Отменить выход",
};

/** Модалка редактирования своего профиля (`PATCH /user/:id`) */
export const EDIT_PROFILE_MODAL_UI = {
  ARIA_DIALOG: "Редактирование профиля",
  ARIA_CLOSE_BACKDROP: "Закрыть без сохранения",
  TITLE: "Редактирование профиля",
  LABEL_EMAIL: "Email (нельзя изменить)",
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT:
    "Только a–z и 0–9, без пробелов, 3–30 символов. Пусто — не менять ник.",
  LABEL_PHONE: "Телефон",
  LABEL_BIRTH: "Дата рождения",
  LABEL_GENDER: "Пол",
  LABEL_ADDRESS: "Адрес",
  LABEL_AVATAR_URL: "Аватар (ссылка или файл)",
  LABEL_BG_PRESET: "Цвет фона",
  LABEL_BG_URL: "Фон — изображение (премиум, ссылка или файл)",
  LABEL_BG_PREVIEW: "Предпросмотр",
  LABEL_BG_URL_ADMIN: "Фон — изображение (приоритет над цветом, ссылка или файл)",
  LABEL_NOTIFICATIONS: "Уведомления по email",
  LABEL_NOTES: "Заметки о себе",
  WORDS_USED: (n, max) => `Слов: ${n} / ${max}`,
  PLACEHOLDER_HTTPS: "https://…",
  SUBMIT_IDLE: "Сохранить",
  SUBMIT_LOADING: "Сохранение…",
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
    notesAboutUser: "Заметки",
    userLoyaltyPoints: "Баллы лояльности",
    userRatingByVotes: "Рейтинг по голосам",
    followersCount: "Подписчики",
    followingCount: "Подписки",
    telegramUserId: "Telegram user id",
    telegramUsername: "Telegram username",
    telegramPhotoUrl: "Telegram photo URL",
    createdAt: "Создан",
    updatedAt: "Обновлён",
  },
  RATING_NONE: "Нет оценок",
  BACKGROUND_CUSTOM_IMAGE: "Своё изображение",
  DATE_FORMAT_OPTIONS: { dateStyle: "short", timeStyle: "short" },
};

/**
 * @param {number} avg
 * @param {number} countVotes
 * @param {number} totalRating
 */
export function formatUserProfileRatingLine(avg, countVotes, totalRating) {
  return `среднее ${avg.toFixed(1)} · голосов ${countVotes} · сумма ${totalRating}`;
}
