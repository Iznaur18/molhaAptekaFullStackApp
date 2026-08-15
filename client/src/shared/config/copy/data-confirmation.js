// Автосгенерировано из appUiCopy.js: домен «data-confirmation».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
} from "@molha/api-contract";

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
    `Не заменяет премиум: ${SELLER_PRODUCTS_LIMIT_PREMIUM} товаров, золотая обводка и сторис — отдельно.`,
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
