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
  FETCH_USER_PROFILE_FALLBACK: "Не удалось загрузить профиль",
  FETCH_USERS_SEARCH_FALLBACK: "Не удалось загрузить пользователей",
  FETCH_USERS_PAGE_FALLBACK: "Не удалось загрузить список",
  FETCH_MY_PRODUCTS_FALLBACK: "Не удалось загрузить ваши товары",
  DELETE_MY_PRODUCT_FALLBACK: "Не удалось удалить товар",
  CREATE_PRODUCT_FALLBACK: "Не удалось создать товар",
  VOTE_SUBMIT_FALLBACK: "Не удалось отправить оценку",
  FETCH_MY_VOTE_FALLBACK: "Не удалось загрузить вашу оценку",
};

/** Поиск пользователей (`GET /user/search`) */
export const USER_SEARCH_UI = {
  API_PAGE_LIMIT: 100,
};

/** Главная страница каталога */
export const HOME_PAGE_UI = {
  PRODUCT_CATEGORY_FILTER_LIST_ID: "home-product-category-filter-list",
  LOADING_CATALOG: "Загрузка каталога…",
  FETCH_PRODUCTS_FALLBACK: "Не удалось загрузить товары",
  FETCH_PROFILE_FALLBACK: "Не удалось загрузить профиль",
  FETCH_MY_PROFILE_FALLBACK: "Не удалось загрузить мой профиль",
  TITLE_CATALOG: "Каталог товаров",
  BREADCRUMB_HOME: "Главная",
  BREADCRUMB_MY_PROFILE: "Мой профиль",
  BREADCRUMB_MY_PRODUCTS: "Мои товары",
  BREADCRUMB_SEPARATOR: " > ",
  ARIA_MY_PRODUCTS_CRUMB: "Главная, Мой профиль, Мои товары",
  TITLE_USERS: "Пользователи",
  NAV_TO_CATALOG: "← Каталог товаров",
  NAV_TO_USERS: "Пользователи",
  FILTER_BUTTON: "Фильтр",
  CATEGORY_ALL: "Все категории",
  SUBTITLE_MY_ONLY: "Показаны только ваши товары.",
  CREATE_PRODUCT_BUTTON: "Создать товар",
  SUBTITLE_ALL_PRODUCTS: "Все позиции из каталога",
  AUTH_MY_PROFILE: "Мой профиль",
  AUTH_LOGIN: "Войти",
  AUTH_REGISTER: "Зарегистрироваться",
  EMPTY_MY_PRODUCTS: "У вас пока нет товаров в каталоге.",
  EMPTY_NO_PRODUCTS: "Товаров пока нет.",
  EMPTY_MY_FILTERED: "У вас нет товаров в каталоге с текущими фильтрами.",
  EMPTY_CATEGORY: "В выбранной категории товаров нет.",
};

/** Экран списка пользователей */
export const USERS_PAGE_UI = {
  LOADING: "Загрузка пользователей…",
  EMPTY: "Пользователей пока нет.",
};

/** Строка каталога пользователей */
export const USER_LIST_ROW_UI = {
  MISSING_NAME: COMMON_UI.EM_DASH,
  RATING_TITLE: "Средняя оценка · число голосов",
};

/** Модалка создания товара (`POST /product`) */
export const CREATE_PRODUCT_MODAL_UI = {
  ARIA_DIALOG: "Создание товара",
  ARIA_CLOSE_BACKDROP: "Закрыть окно создания товара",
  TITLE: "Новый товар",
  LABEL_NAME: "Название",
  LABEL_DESCRIPTION: "Описание",
  LABEL_IMAGE_URL: "Ссылка на изображение (необязательно)",
  LABEL_PRICE: "Цена",
  LABEL_CATEGORY: "Категория",
  LABEL_AVAILABLE: "Товар в наличии",
  SUBMIT_IDLE: "Создать",
  SUBMIT_LOADING: "Создаём…",
  ERROR_PRICE: "Укажите корректную цену (число ≥ 0)",
  ERROR_GENERIC: "Не удалось создать товар",
};

/** Карточка товара (заголовок по умолчанию) */
export const PRODUCT_CARD_UI = {
  DEFAULT_TITLE: "Товар",
  DELETE_PRODUCT: "Удалить товар",
  DELETE_PRODUCT_PENDING: "Удаление…",
  DELETE_CONFIRM_QUESTION: "Вы уверены, что хотите удалить этот товар?",
  DELETE_CONFIRM_YES: "Да, удалить",
  DELETE_CONFIRM_CANCEL: "Отмена",
  IMAGE_LIGHTBOX_OPEN_LABEL: "Показать изображение в полном размере",
  IMAGE_LIGHTBOX_CLOSE: "Закрыть просмотр изображения",
  IMAGE_LIGHTBOX_DIALOG_LABEL: "Изображение товара",
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
  LABEL_USERNAME: "Ник (userName)",
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
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
};

/** Оценка пользователя `POST /vote/:targetUserId` */
export const USER_VOTE_RATING_UI = {
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
  LOGOUT: "Выйти",
  LOGOUT_CONFIRM: "Вы точно хотите выйти?",
  LOGOUT_YES: "Да выйти",
  LOGOUT_CANCEL: "Отменить выход",
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
