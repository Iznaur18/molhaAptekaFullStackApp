// Автосгенерировано из appUiCopy.js: домен «admin».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import { COMMON_UI } from "./common.js";

/** Экран списка пользователей */
export const USERS_PAGE_UI = {
  LOADING: "Загрузка пользователей…",
  EMPTY: "Пользователей пока нет.",
  EMPTY_BY_QUERY: "Никого не нашли по этому запросу.",
  SEARCH_TOO_SHORT: "Введите не менее 3 символов для поиска.",
  LOGIN_HINT: "Войдите, чтобы смотреть пользователей.",
  LOGIN_BUTTON: "Войти",
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
  PREVIEW_LOADING: "Загрузка товара…",
  PREVIEW_NAME_LABEL: "Товар",
  PREVIEW_REGION_LABEL: "Регион товара",
  PREVIEW_NOT_VISIBLE: "Товар недоступен в каталоге — добавить нельзя",
  PREVIEW_OK: "Можно добавить в эту подборку",
  DETAILS_BUTTON: "В популярные",
  DETAILS_BUTTON_IN_LIST: "В популярных",
  DETAILS_MODAL_TITLE: "Популярные товары",
  DETAILS_MODAL_CLOSE: "Закрыть",
  DETAILS_MODAL_HINT:
    "Подборки вкладки «Товары» (не «Категории»). Списки региона товара — первыми; заголовок любой.",
  DETAILS_MODAL_EMPTY:
    "Нет подборок товаров. Профиль → Специальный блок → вкладка «Товары» (не «Категории»).",
  DETAILS_MODAL_LOADING: "Загрузка списков…",
  DETAILS_ADD: "Добавить",
  DETAILS_REMOVE: "Убрать",
  DETAILS_ADD_SUCCESS: "Товар добавлен в популярные",
  DETAILS_REMOVE_SUCCESS: "Товар убран из популярных",
  DETAILS_REGION_FALLBACK: "Регион",
  DETAILS_REGION_MISMATCH: "регион товара не совпадает",
};

/** Админка: подборки категорий на главной */
export const POPULAR_CATEGORIES_ADMIN_PAGE_UI = {
  TAB_PRODUCTS: "Товары",
  TAB_CATEGORIES: "Категории",
  TITLE: "Подборки на главной",
  HINT: "Списки с заголовком, регионом и категориями (дерево или личные). На главной подборка видна только в своём регионе.",
  SEARCH_PLACEHOLDER: "Заголовок или refId…",
  LOAD_ERROR: "Не удалось загрузить списки категорий",
  CREATE_ERROR: "Не удалось создать список",
  SAVE_ERROR: "Не удалось сохранить",
  DELETE_ERROR: "Не удалось удалить список",
  REORDER_ERROR: "Не удалось изменить порядок",
  ADD_ITEM_ERROR: "Не удалось добавить категорию",
  REMOVE_ITEM_ERROR: "Не удалось удалить категорию",
  EMPTY: "Списков нет — создайте первый",
  CREATE_HEADING: "Новый список",
  LIST_TITLE_LABEL: "Заголовок на главной",
  LIST_REGION_LABEL: "Регион показа",
  REGION_REQUIRED: "Укажите регион",
  TITLE_REQUIRED: "Укажите заголовок",
  CREATE_LIST: "Создать список",
  SAVE_TITLE: "Сохранить",
  CATEGORY_KIND_LABEL: "Тип категории",
  CATEGORY_KIND_TREE: "Из дерева",
  CATEGORY_KIND_PERSONAL: "Личная категория",
  CATEGORY_SEARCH_LABEL: "Поиск по названию",
  CATEGORY_SEARCH_PLACEHOLDER: "Например: витамины",
  CATEGORY_SEARCH_LOADING: "Ищем категории…",
  CATEGORY_SEARCH_EMPTY: "Ничего не найдено",
  CATEGORY_BROWSE_TITLE: "Или выберите из дерева",
  CATEGORY_DRILL_ARIA: (label) => `Открыть подкategории: ${label}`,
  PERSONAL_CATEGORY_LABEL: "Личная категория",
  PERSONAL_CATEGORY_PLACEHOLDER: "Выберите категорию",
  PERSONAL_CATEGORY_LOADING: "Загрузка…",
  PERSONAL_CATEGORY_LOAD_ERROR: "Не удалось загрузить личные категории",
  PERSONAL_CATEGORY_EMPTY: "Нет активных личных категорий в этом регионе",
  CATEGORY_REQUIRED: "Выберите категорию",
  ADD_CATEGORY: "Добавить категорию",
  REMOVE_CATEGORY: "Удалить",
  DELETE_LIST: "Удалить список",
  DELETE_LIST_CONFIRM: "Удалить список и все категории в нём?",
  EMPTY_LIST: "В списке пока нет категорий",
  MOVE_UP_ARIA: "Поднять список",
  MOVE_DOWN_ARIA: "Опустить список",
  PREVIEW_LOADING: "Загрузка категории…",
  PREVIEW_NAME_LABEL: "Категория",
  PREVIEW_REGION_LABEL: "Регион",
  PREVIEW_NOT_VISIBLE: "Категория недоступна в каталоге — добавить нельзя",
  PREVIEW_OK: "Можно добавить в эту подборку",
};

/** Админка: платформенная аналитика (KPI из primary aggregates) */
export const ADMIN_ANALYTICS_PAGE_UI = {
  TITLE: "Аналитика платформы",
  HINT: "KPI считаются из первичных коллекций (Order, User, Product, ProductView), не из счётчиков на карточках. Период — UTC. См. docs/analytics/metrics.md.",
  LOADING: "Загрузка…",
  REFRESH: "Обновить",
  EXPORT: "Скачать CSV",
  EXPORT_LOADING: "Экспорт…",
  EXPORT_ERROR: "Не удалось скачать отчёт",
  EXPORT_SHA256: (hash) => `SHA-256: ${hash}`,
  PLAUSIBLE_OPEN: "Открыть Plausible",
  PLAUSIBLE_HINT:
    "Внешний traffic (Plausible). Задайте VITE_PLAUSIBLE_SCRIPT_SRC (pa-….js из кабинета) или DOMAIN + SHARED_URL.",
  RECONCILE: "Сверить integrity",
  RECONCILE_LOADING: "Сверка…",
  RECONCILE_ERROR: "Не удалось запустить сверку",
  PERIOD_TODAY: "Сегодня",
  PERIOD_7D: "7 дней",
  PERIOD_30D: "30 дней",
  PERIOD_ALL: "Всё время",
  META: (asOf, version, periodKey) =>
    `asOf ${asOf} · definitions v${version} · период ${periodKey}`,
  METRIC_NEW_USERS: "Новые пользователи",
  METRIC_PUBLICATIONS: "Публикации",
  METRIC_ORDERS: "Заказы",
  METRIC_SOLD_UNITS: "Продано шт.",
  METRIC_GMV: "GMV ₽",
  METRIC_VIEWS: "Просмотры",
  INTEGRITY_TITLE: "Integrity",
  INTEGRITY_EMPTY: "Сверка ещё не запускалась. Нажмите «Сверить integrity» или дождитесь nightly job.",
  INTEGRITY_OK: "Integrity OK",
  INTEGRITY_BAD: "Integrity: есть расхождения",
  /** @param {{ ranAt?: string|null; soldQuantityMismatches?: number; uniqueViewerCountMismatches?: number; productsChecked?: number }} r */
  INTEGRITY_DETAIL: (r) =>
    `ranAt ${r.ranAt ?? "—"} · sold mismatches ${r.soldQuantityMismatches ?? 0} · view mismatches ${r.uniqueViewerCountMismatches ?? 0} · products ${r.productsChecked ?? 0}`,
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

/** Админка: рассылка уведомлений всем пользователям */
export const STAFF_BROADCAST_NOTIFICATIONS_ADMIN_PAGE_UI = {
  TITLE: "Уведомления",
  HINT: "Сообщение получат все активные незаблокированные пользователи (в приложении и системным push, если включён).",
  COUNT_LOADING: "Считаем получателей…",
  COUNT_ERROR: "Не удалось посчитать получателей",
  COUNT: (n) => `Получателей: ${n}`,
  TITLE_LABEL: "Заголовок",
  TITLE_PLACEHOLDER: "Например: Обновление сервиса",
  MESSAGE_LABEL: "Текст",
  MESSAGE_PLACEHOLDER: "Текст уведомления…",
  VALIDATION_REQUIRED: "Заполните заголовок и текст",
  CONFIRM: (n) => `Отправить уведомление ${n} пользователям?`,
  SEND: "Отправить всем",
  SENDING: "Отправка…",
  SUCCESS: (n) => `Отправлено: ${n}`,
  SEND_ERROR: "Не удалось отправить уведомление",
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
  SEARCH_PLACEHOLDER: "Название, slug, ключевые слова, подпись плитки…",
  /** @param {string} label */
  STOREFRONT_LABEL: (label) => `На витрине плитка называется «${label}»`,
  /** @param {string} path */
  PARENT_LEAF_OPTION: (path) => `${path} — сейчас лист, товары переедут в новую`,
  /** @param {number} count */
  MOVED_PRODUCTS: (count) =>
    `Категория создана. Товаров переехало в неё: ${count}`,
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
  TAB_BADGES: "Бейджи товара",
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

export const PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI = {
  TITLE: "Бейджи товара",
  HINT: "Картинка и текст для окна при нажатии на бейдж в деталях товара. Заголовок окна = текст бейджа на товаре.",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить описания бейджей",
};

export const PRODUCT_BADGE_EXPLAIN_ADMIN_UI = {
  LABEL_IMAGE: "Картинка в окне",
  LABEL_DESCRIPTION: "Описание",
  DESCRIPTION_PLACEHOLDER: "Текст для покупателя…",
  SAVE: "Сохранить",
  SAVING: "Сохранение…",
  SAVED: "Сохранено",
  SAVE_ERROR: "Не удалось сохранить",
  RESET_IMAGE: "Сбросить картинку",
  RESET_DESCRIPTION: "Сбросить текст",
  TITLE_AFFILIATE: "Партнёрам",
  TITLE_DISCOUNT: "Скидка",
  TITLE_LOYALTY: "Баллы лояльности",
  HINT_ORIGINAL: "Бейдж «Оригинал».",
  HINT_RAFFLE: "Бейдж «Розыгрыш».",
  HINT_AFFILIATE: "Бейдж «Партнёрам N%». Процент только в заголовке окна.",
  HINT_LISTING_ORIGIN: "Статус происхождения товара.",
  HINT_PRICE_MARKET: "Оценка цены относительно рынка.",
  HINT_DISCOUNT: "Бейдж скидки у цены.",
  HINT_LOYALTY: "Бейдж баллов у цены.",
  HINT_AUCTION: "Бейдж «Аукцион» в деталях товара.",
  HINT_INSTALLMENT: "Бейдж «Рассрочка» в деталях товара.",
  HINT_WHOLESALE: "Бейдж «Оптовая цена» в деталях товара.",
  HINT_RENTAL: "Бейдж «Аренда» в деталях товара.",
  HINT_PROMO: "Бейдж «Промокод» в деталях товара.",
  HINT_NEAR_DISTANCE: "Бейдж расстояния «~км» в деталях товара.",
  TITLE_AUCTION: "Аукцион",
  TITLE_INSTALLMENT: "Рассрочка",
  TITLE_WHOLESALE: "Оптовая цена",
  TITLE_RENTAL: "Аренда",
  TITLE_PROMO: "Промокод",
  TITLE_NEAR_DISTANCE: "Расстояние",
  TITLE_PROFILE_ADDRESS: "Адрес в профиле",
  HINT_PROFILE_ADDRESS:
    "Подсказка без адреса: картинка и текст окна, которое появляется на главной.",
  TITLE_SAFE_DEAL: "Безопасная сделка",
  HINT_SAFE_DEAL:
    "Значок проверенного продавца: что увидит покупатель, нажав на него в карточке товара.",
};

/**
 * @param {number} avg
 * @param {number} countVotes
 * @param {number} totalRating
 */
