/**
 * Статичные подписи интерфейса и числа, сгруппированные по темам (главная, профиль, API…).
 * Не хранит динамические ответы сервера — только дефолты и шаблоны.
 */

/** Общие символы и подписи */
export const COMMON_UI = {
  EM_DASH: "—",
  MODAL_CLOSE_GLYPH: "×",
  LOCALE_RU: "ru-RU",
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
  FETCH_USERS_SEARCH_FALLBACK: "Не удалось загрузить пользователей",
  FETCH_MY_PRODUCTS_FALLBACK: "Не удалось загрузить ваши товары",
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
  APPROVE_PRODUCT_MODERATION_FALLBACK: "Не удалось одобрить товар",
  REJECT_PRODUCT_MODERATION_FALLBACK: "Не удалось отклонить товар",
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

/** Главная страница каталога */
export const HOME_PAGE_UI = {
  PRODUCT_CATEGORY_FILTER_LIST_ID: "home-product-category-filter-list",
  LOADING_CATALOG: "Загрузка каталога…",
  FETCH_PRODUCTS_FALLBACK: "Не удалось загрузить товары",
  FETCH_PROFILE_FALLBACK: "Не удалось загрузить профиль",
  FETCH_MY_PROFILE_FALLBACK: "Не удалось загрузить мой профиль",
  // TITLE_CATALOG: "Каталог товаров",
  TITLE_CATALOG: "iziBuy — покупай и продавай",
  BREADCRUMB_HOME: "Главная",
  BREADCRUMB_MY_PROFILE: "Мой профиль",
  BREADCRUMB_MY_PRODUCTS: "Мои товары",
  BREADCRUMB_SEPARATOR: " > ",
  ARIA_MY_PRODUCTS_CRUMB: "Главная, Мой профиль, Мои товары",
  TITLE_USERS: "Пользователи",
  TITLE_CART: "Корзина",
  TITLE_MY_ORDERS: "Мои покупки",
  TITLE_MY_SALES: "Мои продажи",
  TITLE_ADMIN_ORDERS: "Все заказы",
  TITLE_PRODUCT_MODERATION: "На модерации",
  NAV_TO_CATALOG: "← Каталог товаров",
  NAV_TO_USERS: "Пользователи",
  NAV_TO_CART: "Корзина",
  NAV_TO_MY_ORDERS: "Мои покупки",
  NAV_TO_ADMIN_ORDERS: "Все заказы",
  FILTER_BUTTON: "Фильтр",
  SORT_LABEL: "Сортировка",
  SHOW_HIDDEN_PRODUCTS: "Показывать скрытые товары",
  CATEGORY_ALL: "Все категории",
  SUBTITLE_MY_ONLY: "Показаны только ваши товары.",
  LIST_PRODUCT_BUTTON: "Разместить товар",
  LOGIN_TO_LIST_PRODUCT: "Войти, чтобы разместить",
  SUBTITLE_ALL_PRODUCTS: "Все позиции из каталога",
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
  LABEL: "Корзина",
  ARIA: "Открыть корзину",
  COUNT_ARIA: "Товаров в корзине",
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
  ADDRESS_MAX_LENGTH: 300,
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
};

/** Страница «Мои покупки» */
export const MY_ORDERS_PAGE_UI = {
  TITLE: "Мои покупки",
  LOADING: "Загрузка покупок…",
  EMPTY: "У вас пока нет покупок.",
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
  PRODUCT_FILTER_LABEL: "Товары",
  PRODUCT_FILTER_EMPTY_CATALOG: "В каталоге нет товаров — фильтр по позициям недоступен.",
  EMPTY_BY_PRODUCT_FILTER: "По выбранным товарам продаж не найдено.",
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
  EMPTY_BY_FILTERS: "Никого не нашли с такими фильтрами.",
  SORT_LABEL: "Сортировка",
  SORT_NAME: "По имени",
  SORT_RATING: "По рейтингу",
  MIN_RATING_LABEL: "Средняя оценка от",
  MIN_RATING_ANY: "Любая",
  FILTER_ROLE_LABEL: "Роль",
  FILTER_ROLE_ANY: "Любая",
  FILTER_PREMIUM_LABEL: "Премиум",
  FILTER_PREMIUM_ANY: "Все",
  FILTER_PREMIUM_ONLY: "Только премиум",
  FILTER_BLOCKED_LABEL: "Блокировка",
  FILTER_BLOCKED_ANY: "Не заблокированные",
  FILTER_BLOCKED_ONLY: "Только заблокированные",
  FILTER_ACTIVE_LABEL: "Учётка",
  FILTER_ACTIVE_ANY: "Активные",
  FILTER_ACTIVE_INACTIVE: "Отключённые",
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

/** Строка каталога пользователей */
export const USER_LIST_ROW_UI = {
  BADGE_PREMIUM: "Премиум",
  BADGE_BLOCKED: "Блок",
  BADGE_INACTIVE: "Откл.",
  MISSING_NAME: COMMON_UI.EM_DASH,
  RATING_TITLE: "Средняя оценка · число голосов",
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
    "Ссылки на изображения (необязательно, до 5 URL с http/https)",
  IMAGE_ORDER_HINT: "Перетащите за ⋮⋮ — порядок в каталоге (1 — главное фото).",
  DRAG_HANDLE_ARIA: "Перетащить для смены порядка",
  ADD_IMAGE_ROW: "Добавить ещё фото",
  REMOVE_IMAGE_ROW_ARIA: "Удалить поле ссылки на изображение",
  IMAGE_ROW_ARIA_PREFIX: "Ссылка на изображение",
  LABEL_PRICE: "Цена",
  LABEL_CATEGORY: "Категория",
  LABEL_AVAILABLE: "Товар в наличии",
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
};

/** Блок статуса товара в модалке (admin / moderator) */
export const PRODUCT_DETAILS_ADMIN_STATUS_UI = {
  SECTION_ARIA: "Служебная информация о товаре",
  HEADING: "Модерация и ограничения",
  MODERATION_STATUS_LABEL: "Статус модерации",
  MODERATION_COMMENT_LABEL: "Комментарий модератора",
  CATALOG_LABEL: "В общем каталоге",
  SALES_LOCK_LABEL: "Скрытие и удаление",
  SALES_LOCK_BLOCKED: "Заблокировано — есть незавершённые заказы",
  SALES_LOCK_CLEAR: "Доступно — нет блокирующих заказов",
  SELLER_SECTION_HEADING: "Продавец",
  SELLER_EMAIL_LABEL: "Email",
  SELLER_PHONE_LABEL: "Телефон",
  SELLER_RATING_LABEL: "Средняя оценка",
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
  EDIT_PRODUCT: "Изменить",
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
  LABEL_AVATAR_URL: "URL аватара (avatarUrl → userAvatarUrl)",
  LABEL_BG_URL: "URL фона (backgroundUrl → userBackgroundUrl)",
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

/** «Мой профиль» в шапке модалки и выход */
export const MY_PROFILE_MODAL_UI = {
  TAB_TITLE: "Мой профиль",
  TAB_MY_PRODUCTS: "Мои товары",
  TAB_MY_SALES: "Мои продажи",
  TAB_MY_ORDERS: "Мои покупки",
  TAB_ADMIN_ORDERS: "Все заказы",
  TAB_PRODUCT_MODERATION: "На модерации",
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
  LABEL_AVATAR_URL: "URL аватара",
  LABEL_BG_URL: "URL фона",
  LABEL_NOTIFICATIONS: "Уведомления по email",
  LABEL_NOTES: "Заметки о себе",
  WORDS_USED: (n, max) => `Слов: ${n} / ${max}`,
  PLACEHOLDER_HTTPS: "https://…",
  SUBMIT_IDLE: "Сохранить",
  SUBMIT_LOADING: "Сохранение…",
  CANCEL: "Отмена",
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
    userBackgroundUrl: "URL фона",
    isActiveUser: "Активен",
    isBlockedUser: "Заблокирован",
    userRole: "Роль",
    userDiscountPercent: "Скидка, %",
    notificationsEnabled: "Уведомления",
    isPremiumUser: "Премиум",
    notesAboutUser: "Заметки",
    userLoyaltyPoints: "Баллы лояльности",
    buyList: "Список покупок (id)",
    userRatingByVotes: "Рейтинг по голосам",
    telegramUserId: "Telegram user id",
    telegramUsername: "Telegram username",
    telegramPhotoUrl: "Telegram photo URL",
    createdAt: "Создан",
    updatedAt: "Обновлён",
  },
  RATING_NONE: "Нет оценок",
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
