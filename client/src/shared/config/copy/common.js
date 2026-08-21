// Автосгенерировано из appUiCopy.js: домен «common».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Общие символы и подписи */
export const COMMON_UI = {
  EM_DASH: "—",
  LOCALE_RU: "ru-RU",
  REQUIRED_FIELD_HINT: "Обязательно",
};

/** Белый экран / падение чанка после деплоя */
export const APP_RUNTIME_UI = {
  CRASH_TITLE: "Страница не открылась",
  CRASH_TEXT: "Обновите сайт — это не удаляет вход в аккаунт.",
  CRASH_RELOAD: "Обновить",
};

/** Блокировка landscape на touch-устройствах (web) */
export const APP_PORTRAIT_LOCK_UI = {
  HINT: "Поверните устройство вертикально",
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
  LABEL: "Превью-видео (необязательно)",
  HINT: "MP4, WebM или MOV с iPhone. Длинное видео сервер сам обрежет до 3 секунд и сожмёт в MP4 для всех браузеров. Нужно хотя бы одно фото товара.",
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
  FETCH_PRODUCT_QUESTIONS_FALLBACK: "Не удалось загрузить вопросы",
  FETCH_PRODUCT_QUESTION_SUMMARY_FALLBACK: "Не удалось загрузить вопросы",
  ASK_PRODUCT_QUESTION_FALLBACK: "Не удалось отправить вопрос",
  ANSWER_PRODUCT_QUESTION_FALLBACK: "Не удалось отправить ответ",
  DELETE_PRODUCT_QUESTION_FALLBACK: "Не удалось удалить вопрос",
  HIDE_PRODUCT_QUESTION_FALLBACK: "Не удалось скрыть вопрос",
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
  FETCH_BADGE_EXPLAINS_FALLBACK: "Не удалось загрузить описания бейджей",
  PATCH_BADGE_EXPLAIN_FALLBACK: "Не удалось сохранить описание бейджа",
  PAUSE_RAFFLE_FALLBACK: "Не удалось снять розыгрыш с витрины",
  SET_RAFFLE_PARTICIPATION_FALLBACK: "Не удалось обновить участие в розыгрыше",
  FETCH_RAFFLES_QUEUE_FALLBACK: "Не удалось загрузить очередь розыгрышей",
  FETCH_RAFFLES_COUNT_FALLBACK: "Не удалось загрузить счётчик розыгрышей",
  APPROVE_RAFFLE_FALLBACK: "Не удалось одобрить розыгрыш",
  REJECT_RAFFLE_FALLBACK: "Не удалось отклонить розыгрыш",
};

/** Intro при первом заходе на сайт */
export const APP_INTRO_UI = {
  SKIP: "Пропустить",
  ENABLE_SOUND: "Включить звук",
  DISABLE_SOUND: "Выключить звук",
  FALLBACK_TITLE: "Gitorg",
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

/** Уведомление о cookie (web, первый визит) */
export const COOKIE_NOTICE_UI = {
  TITLE: "Файлы cookie",
  ACCEPT: "Понятно",
  PRIVACY_LINK: "Политика конфиденциальности",
  ARIA_DIALOG: "Уведомление о файлах cookie",
};
