// Автосгенерировано из appUiCopy.js: домен «profile».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

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
  TAB_BROADCAST_NOTIFICATIONS_ADMIN: "Уведомления",
  TAB_SEARCH_SYNONYMS_ADMIN: "Синонимы поиска",
  TAB_POPULAR_PRODUCTS_ADMIN: "Специальный блок",
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
  TAB_AFFILIATE_LISTINGS: "Заработок с объявлений",
  TAB_ADVERTISING: "Реклама",
  TAB_ONEC_INTEGRATION: "1С",
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
  CUSTOM: "Пользовательский",
};

export const WEB_PUSH_SETTINGS_UI = {
  LABEL: "Push на устройство",
  ENABLE: "Включить",
  DISABLE: "Выключить",
  ENABLED: "Включены",
  DISABLED: "Выключены",
  UNSUPPORTED: "Браузер не поддерживает системные push",
  IOS_HINT: "На iPhone: «Поделиться» → «На экран Домой», затем включите здесь",
  PENDING: "Секунду…",
  ERROR_PERMISSION: "Разрешите уведомления в настройках браузера",
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
  LABEL_EMAIL: "Email",
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT:
    "Только a–z и 0–9, без пробелов, 3–30 символов. Пусто — не менять ник.",
  LABEL_PHONE: "Телефон",
  PHONE_NOT_VERIFIED: "Номер не подтверждён",
  PHONE_VERIFIED: "Номер подтверждён",
  PHONE_SEND_CODE: "Получить код SMS",
  PHONE_SEND_CODE_LOADING: "Отправка…",
  PHONE_CONFIRM_CODE: "Подтвердить SMS",
  PHONE_CONFIRM_LOADING: "Проверка…",
  PHONE_CODE_LABEL: "Код из SMS",
  PHONE_CODE_PLACEHOLDER: "000000",
  PHONE_BIND_SUCCESS: "Телефон подтверждён",
  PHONE_CHANGE_PENDING: "Подтвердите новый номер SMS-кодом перед сохранением профиля",
  PHONE_CLEAR_FORBIDDEN: "Очистка телефона недоступна. Смените номер через SMS-код",
  EMAIL_NOT_VERIFIED: "Email не подтверждён",
  EMAIL_VERIFIED: "Email подтверждён",
  EMAIL_SEND_CODE: "Получить код на email",
  EMAIL_SEND_CODE_LOADING: "Отправка…",
  EMAIL_CONFIRM_CODE: "Подтвердить email",
  EMAIL_CONFIRM_LOADING: "Проверка…",
  EMAIL_CODE_LABEL: "Код из письма",
  EMAIL_CODE_PLACEHOLDER: "000000",
  EMAIL_BIND_SUCCESS: "Email подтверждён",
  EMAIL_CHANGE_PENDING: "Подтвердите новый email кодом из письма перед сохранением профиля",
  EMAIL_CLEAR_FORBIDDEN: "Очистка email недоступна. Смените адрес через код подтверждения",
  SECTION_PASSWORD: "Смена пароля",
  LABEL_CURRENT_PASSWORD: "Текущий пароль",
  LABEL_NEW_PASSWORD: "Новый пароль",
  LABEL_NEW_PASSWORD_CONFIRM: "Повторите новый пароль",
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_TOO_SHORT: "Пароль должен быть не менее 6 символов",
  PASSWORD_MISMATCH: "Пароли не совпадают",
  PASSWORD_CURRENT_REQUIRED: "Введите текущий пароль",
  PASSWORD_CHANGE_SUBMIT: "Сменить пароль",
  PASSWORD_CHANGE_LOADING: "Сохранение…",
  PASSWORD_CHANGE_SUCCESS: "Пароль успешно изменён",
  PASSWORD_CHANGE_ERROR: "Не удалось сменить пароль",
  SHOW_PASSWORD_ARIA: "Показать пароль",
  HIDE_PASSWORD_ARIA: "Скрыть пароль",
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
  SHOW_PHONE_NUMBER_PENDING: "Загрузка…",
  SHOW_PHONE_NUMBER_ERROR: "Не удалось показать номер",
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

export const ADDRESS_PROMPT_UI = {
  TITLE: "Добавьте адрес",
  CTA: "Указать адрес",
  FALLBACK_DESCRIPTION:
    "Укажите адрес в профиле — так проще находить товары рядом и оформлять доставку.",
};
