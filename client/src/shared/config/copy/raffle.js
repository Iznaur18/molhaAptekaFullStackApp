// Автосгенерировано из appUiCopy.js: домен «raffle».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Создание розыгрыша (вкладка «Реклама») */
export const RAFFLE_ADVERTISING_PAGE_UI = {
  CARD_TITLE: "Розыгрыш",
  CARD_BADGE: "цель",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить услугу «Розыгрыш»",
  UNLOCK_FALLBACK: "Не удалось оплатить создание розыгрыша",
  UNLOCK_SUCCESS: "Баллы зарезервированы. Заполните розыгрыш.",
  DESCRIPTION:
    "Создайте розыгрыш для своих товаров. После оплаты 3000 баллов откроется форма заявки. После модерации розыгрыш появится на витрине (до 200 активных одновременно). При отклонении баллы возвращаются.",
  /** @param {number} price */
  PRICE: (price) => `${price} баллов`,
  COST_LABEL: "Стоимость",
  MODERATION_LABEL: "Модерация",
  MODERATION_VALUE: "Обязательна",
  STATUS_PENDING: "На модерации.",
  STATUS_ACTIVE: "Розыгрыш активен.",
  STATUS_PAUSED: "Розыгрыш на паузе.",
  PAY_AND_CREATE: "Оплатить 3000 баллов",
  /** @param {number} price */
  PAY_AND_CREATE_WITH_PRICE: (price) => `Оплатить ${price} баллов`,
  CONTINUE_CREATE: "Заполнить розыгрыш",
  INSUFFICIENT_POINTS: "Недостаточно баллов для оплаты.",
  DATA_CONFIRMATION_REQUIRED: "Подтвердите данные профиля, чтобы создать розыгрыш.",
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
  DELETE_CONFIRM: "Удалить розыгрыш? Участие товаров будет снято, восстановить нельзя.",
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

export const USERS_LOYALTY_RAFFLE_ADMIN_UI = {
  TAB_MODERATION: "Модерация",
  TAB_USERS_RAFFLE: "Среди пользователей",
  TITLE: "Розыгрыш среди пользователей",
  DESCRIPTION_LABEL: "Описание",
  DESCRIPTION_PLACEHOLDER: "Текст под прогресс-баром на странице пользователей",
  GOAL_LABEL: "Цель баллов",
  SAVE: "Сохранить",
  SAVING: "Сохраняем…",
  SAVED: "Сохранено",
  LOADING: "Загрузка…",
};

export const RAFFLE_PRODUCTS_PAGE_UI = {
  TITLE: "Товары розыгрыша",
  EYEBROW: "Розыгрыш",
  LOADING: "Загрузка…",
  EMPTY: "Нет товаров в этом розыгрыше.",
};
