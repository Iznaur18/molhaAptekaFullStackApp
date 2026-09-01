// Домен «курьеры»: заявка пользователя и очередь модерации.

/** Страница заявки курьера (в обычном профиле — отдельного кабинета нет). */
export const COURIER_UI = {
  TITLE: "Стать курьером",
  INTRO:
    "Зарегистрируйте авто, и после проверки модератором вы сможете брать заказы на доставку в своём регионе.",
  STATUS_NONE: "Заявка не подана",
  STATUS_PENDING: "На проверке",
  STATUS_APPROVED: "Подтверждён",
  STATUS_REJECTED: "Отклонена",
  ADDRESS_REQUIRED:
    "Сначала укажите адрес в профиле — по нему определяется ваш регион доставки.",
  APPROVED_HINT: "Вы можете брать заказы на доставку.",
  /** @param {string} city */
  REGION: (city) => `Ваш регион: ${city}.`,
  REJECTION_REASON: "Причина отказа",
  FIELD_MAKE: "Марка и модель",
  FIELD_COLOR: "Цвет",
  FIELD_PLATE: "Госномер",
  PLACEHOLDER_MAKE: "Lada Granta",
  PLACEHOLDER_COLOR: "белый",
  PLACEHOLDER_PLATE: "х123ум797",
  SUBMIT: "Отправить заявку",
  RESUBMIT: "Отправить заново",
  SUBMITTING: "Отправляем…",
  PENDING_HINT: "Заявка на проверке — дождитесь решения модератора.",
  DOCS_HEADING: "Фото авто и документов",
  DOCS_HINT:
    "Все четыре снимка обязательны. Их видят только модераторы — ни продавцу, ни покупателю они не показываются.",
  FIELD_PHOTO_FRONT: "Авто спереди",
  FIELD_PHOTO_REAR: "Авто сзади",
  FIELD_PHOTO_LICENSE: "Водительские права",
  FIELD_PHOTO_REGISTRATION: "ПТС",
  PHOTO_PICK: "Выбрать фото",
  PHOTO_REPLACE: "Заменить",
  PHOTO_UPLOADING: "Загружаем…",
  PHOTO_READY: "Загружено",
  PHOTO_REQUIRED: "Добавьте все четыре снимка",
  PRIVACY_NOTE:
    "Продавец и покупатель увидят ваше имя, рейтинг и данные авто. Права и ПТС не показываются никому, кроме модераторов.",
  LOADING: "Загрузка…",
  ERROR_GENERIC: "Не удалось выполнить действие. Попробуйте ещё раз.",
};

/** Очередь модерации курьеров (админ и модератор). */
export const COURIER_MODERATION_UI = {
  TITLE: "Курьеры (модерация)",
  TAB_PENDING: "На проверке",
  TAB_APPROVED: "Подтверждённые",
  TAB_REJECTED: "Отклонённые",
  FIELD_MAKE: "Авто",
  FIELD_COLOR: "Цвет",
  FIELD_PLATE: "Госномер",
  FIELD_REGION: "Регион",
  FIELD_PHOTOS: "Фото",
  PHOTO_FRONT: "Авто спереди",
  PHOTO_REAR: "Авто сзади",
  PHOTO_LICENSE: "Права",
  PHOTO_REGISTRATION: "ПТС",
  PHOTO_MISSING: "Снимки не приложены",
  FIELD_DECLINED: "Отказов от заявок",
  REASON_LABEL: "Причина отказа",
  REASON_PLACEHOLDER: "Обязательна при отказе",
  REASON_REQUIRED: "Укажите причину отказа — курьер должен понимать, что исправить",
  APPROVE: "Одобрить",
  REJECT: "Отклонить",
  SAVING: "Сохраняем…",
  NO_NAME: "Без имени",
  EMPTY: "Заявок нет.",
  LOADING: "Загрузка заявок…",
  ERROR_GENERIC: "Не удалось выполнить действие. Попробуйте ещё раз.",
};

/** «Обзор» курьера: свободные заказы и активные доставки. */
export const COURIER_OVERVIEW_UI = {
  TITLE: "Обзор",
  TAB_FREE: "Свободные",
  TAB_MINE: "Мои доставки",
  /** @param {string} region @param {number} radiusKm */
  REGION: (region, radiusKm) => `Регион ${region}, до ${radiusKm} км.`,
  NO_GEO_HINT: "Геопозиция не разрешена — сортируем от вашего адреса.",
  /** @param {number} km */
  DISTANCE: (km) => `${km} км`,
  PICKUP: "Забрать",
  DROPOFF: "Привезти",
  ACCEPT: "Принять заказ",
  SAVING: "Сохраняем…",
  STEP_TAKE: "Забрал у продавца",
  STEP_GO: "Выехал",
  STEP_ARRIVED: "Привёз",
  STEP_HANDED: "Вручил",
  CODE_FROM_SELLER: "Код у продавца",
  CODE_FROM_BUYER: "Код у покупателя",
  CONTACTS_LOCKED:
    "Точный адрес и телефон покупателя откроются, когда заберёте заказ.",
  EMPTY_FREE: "Свободных заказов в вашем регионе нет.",
  EMPTY_MINE: "Активных доставок нет.",
  LOADING: "Загрузка…",
  ERROR_GENERIC: "Не удалось выполнить действие. Попробуйте ещё раз.",
  DECLINE: "Отказаться",
  DECLINE_CONFIRM:
    "Заказ вернётся в общий список, а отказ отметится в вашем профиле. Отказаться?",
};

/** Срывы: спор по отправлению, которое зависло у курьера. */
export const SHIPMENT_DISPUTE_UI = {
  OPEN: "Курьер не выходит на связь",
  OPEN_CONFIRM:
    "Заказ уйдёт на разбор модератору. Открыть спор?",
  OPENED: "Открыт спор — с заказом разбирается модератор.",
  QUEUE_TITLE: "Споры по доставке",
  QUEUE_EMPTY: "Открытых споров нет.",
  QUEUE_LOADING: "Загрузка…",
  COURIER: "Курьер",
  SELLER: "Продавец",
  BUYER: "Покупатель",
  REASON: "Причина",
  OPENED_AT: "Открыт",
  NO_REASON: "Причина не указана",
  RESOLVE_RETURNED: "Товар вернулся продавцу",
  RESOLVE_CONFIRMED: "Товар дошёл до покупателя",
  RESOLVE_CONFIRM:
    "Исход спора изменить нельзя: он закрывает сделку. Продолжить?",
  ERROR_GENERIC: "Не удалось выполнить действие. Попробуйте ещё раз.",
};
