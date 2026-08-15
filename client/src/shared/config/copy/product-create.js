// Автосгенерировано из appUiCopy.js: домен «product-create».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
} from "@molha/api-contract";

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
      `До ${SELLER_PRODUCTS_LIMIT_PREMIUM} товаров в каталоге`,
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
    "Подтверждаю, что товар подлинный (оригинал), а не подделка",
  ORIGINALITY_YES: "Да",
  ORIGINALITY_NO: "Нет",
  ERROR_ORIGINALITY: "Выберите: оригинал или нет",
  LABEL_ORIGINALITY: "Оригинал",
  ORIGINALITY_TOGGLE_PENDING: "Сохраняем…",
  CHARS_USED: (n, max) => `Символов: ${n} / ${max}`,
  DESCRIPTION_TOOLBAR_ARIA: "Форматирование описания",
  DESCRIPTION_H1: "H1",
  DESCRIPTION_H1_HINT: "Заголовок: строка или выделение → # текст",
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
  HINT_SALE_REGION_FROM_ADDRESS: "Определится из адреса продажи",
  ERROR_SALE_REGION_REQUIRED: "Укажите адрес продажи с известным регионом",
  LABEL_PICKUP_ADDRESS: "Адрес продажи",
  ERROR_PICKUP_COORDS: "Укажите точку на карте или выберите адрес из подсказки",
  ERROR_CATEGORY_LEAF: "Выберите конечную подкатегорию в дереве категорий",
  LABEL_AVAILABLE: "Товар в наличии",
  LABEL_STOCK_QUANTITY: "Количество в наличии (шт.)",
  ERROR_STOCK: "Укажите количество от 1 до 9999",
  MANAGE_SECTION_TITLE: "Управление товаром",
  MANAGE_SECTION_ARIA: "Дополнительные действия с товаром",
  MANAGE_AUCTION_TITLE: "Аукцион",
  MANAGE_AUCTION_HINT: "Покупатели смогут предлагать свою цену",
  MANAGE_QA_TITLE: "Вопросы и ответы",
  MANAGE_QA_HINT: "Покупатели смогут задавать вопросы о товаре",
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
  MANAGE_RENTAL_TITLE: "Аренда / Прокат",
  MANAGE_RENTAL_HINT: "Покупатели увидят, что товар можно взять в аренду",
  MANAGE_RENTAL_PENDING: "Сохраняем аренду…",
  MANAGE_PROMO_CODES_TITLE: "Промокоды",
  MANAGE_PROMO_CODES_HINT: "До 10 активных кодов со скидкой в процентах",
  MANAGE_PROMO_CODES_PENDING: "Сохраняем промокоды…",
  RENTAL_TOGGLE_PENDING: "Обновляем аренду…",
  RENTAL_MODAL_TITLE: "Аренда / Прокат",
  RENTAL_MODAL_HINT: "Укажите цену аренды и единицу. Дальше настройки добавим отдельно.",
  RENTAL_MODAL_PRICE_LABEL: "Цена аренды, ₽",
  RENTAL_MODAL_UNIT_LABEL: "Единица цены",
  RENTAL_MODAL_UNIT_DAY: "Сутки",
  RENTAL_MODAL_UNIT_DAY_HINT: "₽ / день",
  RENTAL_MODAL_UNIT_HOUR: "Час",
  RENTAL_MODAL_UNIT_HOUR_HINT: "₽ / час",
  RENTAL_MODAL_SAVE: "Сохранить",
  RENTAL_MODAL_CLOSE: "Закрыть",
  RENTAL_MODAL_ERROR_REQUIRED: "Укажите цену аренды и единицу",
  MANAGE_AFFILIATE_TITLE: "Партнёрская услуга",
  MANAGE_AFFILIATE_HINT:
    "Пользователи делятся ссылкой и получают % с покупки",
  MANAGE_AFFILIATE_HINT_ON: (percent) =>
    `Сейчас ${percent}%. Пользователи делятся ссылкой и получают % с покупки`,
  AFFILIATE_TOGGLE_PENDING: "Обновляем партнёрку…",
  AFFILIATE_MODAL_TITLE: "Партнёрская услуга",
  AFFILIATE_MODAL_PERCENT_LABEL: "Процент партнёру, %",
  AFFILIATE_MODAL_SAVE: "Сохранить",
  AFFILIATE_MODAL_CLOSE: "Закрыть",
  AFFILIATE_MODAL_HINT:
    "Обычные пользователи делятся ссылкой на объявление и получают % с подтверждённой покупки. % списывается со свободных баллов лояльности продавца. % может измениться до покупки.",
  AFFILIATE_MODAL_BUDGET_HINT:
    "Держите на балансе достаточно свободных баллов — иначе покупатель не сможет подтвердить заказ с партнёрской выплатой.",
  AFFILIATE_MODAL_ERROR_REQUIRED: "Укажите процент от 1 до 50",
  AFFILIATE_MODAL_PENDING: "Сохраняем…",
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
  LABEL_AFFILIATE_ENABLED: "Партнёрская услуга",
  LABEL_AFFILIATE_PERCENT: "Процент партнёру за приведённого клиента",
  HINT_AFFILIATE:
    "Обычные пользователи смогут делиться ссылкой на объявление и получать % с покупки. % списывается со свободных баллов лояльности при подтверждении заказа. % может измениться до покупки.",
  HINT_AFFILIATE_BUDGET:
    "Держите достаточно свободных баллов — иначе покупатель не сможет подтвердить заказ с партнёрской выплатой.",
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
  WIZARD_STEP_ORIGINALITY_TITLE: "Статус товара",
  WIZARD_STEP_ORIGINALITY_SUBTITLE:
    "Выберите, откуда товар: своё, куплено на перепродажу или вы производитель. Покупатели увидят это в карточке.",
  WIZARD_STEP_ORIGINALITY_MANAGE_SUBTITLE: "Подтвердите, что продаёте официальный товар",
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
  WIZARD_STEP_LABEL_ORIGINALITY: "Статус",
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
  SUBMIT: "Создать",
  SUBMIT_EDIT: "Сохранить",
  SUBMIT_LOADING: "Создаём…",
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
