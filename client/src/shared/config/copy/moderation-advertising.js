// Автосгенерировано из appUiCopy.js: домен «moderation-advertising».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

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
  LABEL_FALLBACK_TITLE: "Заголовок на экране",
  LABEL_FALLBACK_HINT: "Подзаголовок на экране",
  LABEL_MIN_MS: "Минимум показа, мс",
  LABEL_MAX_MS: "Максимум показа, мс",
  LABEL_FADE_MS: "Fade-out, мс",
  TIMING_HINT: "Необязательно — по умолчанию как у платформенного intro.",
  ERROR_FALLBACK_TITLE_REQUIRED: "Укажите заголовок на экране",
  ERROR_FALLBACK_TITLE_TOO_LONG: "Заголовок слишком длинный",
  ERROR_FALLBACK_HINT_REQUIRED: "Укажите подзаголовок на экране",
  ERROR_FALLBACK_HINT_TOO_LONG: "Подзаголовок слишком длинный",
  ERROR_VIDEO_REQUIRED: "Загрузите MP4-ролик",
  ERROR_MIN_MS: "Минимальное время показа вне допустимого диапазона",
  ERROR_MAX_MS: "Максимальное время показа вне допустимого диапазона",
  ERROR_MAX_LT_MIN: "Максимум показа не может быть меньше минимума",
  ERROR_FADE_MS: "Время исчезновения вне допустимого диапазона",
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
  SUBMIT: "Подтвердить",
  CANCEL: "Отменить заявку",
  PREVIEW: "Предпросмотр",
  OPEN_FORM: "Оформить баннер",
  LABEL_REGION: "Регион показа",
  HINT_REGION: "Баннер увидят покупатели только этого региона.",
  ERROR_REGION_REQUIRED: "Выберите регион показа",
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
  SUBMIT: "Подтвердить",
  CANCEL: "Отменить заявку",
  LABEL_NAME: "Название категории",
  LABEL_IMAGE: "Картинка плитки",
  LABEL_REGION: "Регион показа",
  HINT_REGION: "Плитка появится в каталоге только у покупателей этого региона.",
  ERROR_NAME_REQUIRED: "Укажите название категории",
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
  DETAILS_TITLE: "Данные создания",
  DETAILS_ARIA: "Полные данные создания товара",
  SECTION_FACTS: "Параметры объявления",
  SECTION_MEDIA: "Фото и видео",
  VIDEO_LABEL: "Превью-видео",
  COORDS_LABEL: "Координаты",
  COORDS_EMPTY: "Не указаны",
  /** @param {number} lat @param {number} lon */
  COORDS_VALUE: (lat, lon) => `${lat}, ${lon}`,
  OPEN_MAP: "Открыть на карте",
  EMPTY_DESCRIPTION: "Описание не заполнено",
  EMPTY_CHARACTERISTICS: "Характеристики не указаны",
  SELLER_PREMIUM_LABEL: "Премиум",
  SELLER_CONFIRMED_LABEL: "Подтверждённые данные",
  SELLER_REGISTERED_LABEL: "На сайте с",
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
