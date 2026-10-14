// Домен «deal-requests»: заявки на осмотр и услуги — сделки без корзины.
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда.

/** Блок действий в объявлении без корзины. */
export const PRODUCT_DEAL_ACTIONS_UI = {
  REQUEST_BUTTON: { viewing: "Записаться на осмотр", service: "Оставить заявку" },
  SHOW_PHONE: "Показать телефон",
  // Нижняя панель на телефоне: рядом с «Назад» длинные подписи не помещаются.
  REQUEST_BUTTON_SHORT: { viewing: "Записаться", service: "Оставить заявку" },
  PHONE_LOADING: "Загружаем…",
  PHONE_MISSING: "Продавец не указал телефон — оставьте заявку",
  /** @param {string} phone */
  PHONE_CALL_ARIA: (phone) => `Позвонить продавцу: ${phone}`,
  PHONE_FALLBACK_ERROR: "Не удалось показать телефон",
  FORM_TITLE: {
    viewing: "Когда вам удобно посмотреть?",
    service: "Когда нужна услуга?",
  },
  FIELD_TIME: "Дата и время",
  FIELD_ADDRESS: "Адрес, если исполнитель приезжает к вам",
  FIELD_ADDRESS_PLACEHOLDER: "Город, улица, дом",
  FIELD_COMMENT: "Комментарий",
  FIELD_COMMENT_PLACEHOLDER: {
    viewing: "Например: приеду с мастером, нужен час",
    service: "Опишите задачу: что нужно сделать",
  },
  SUBMIT: "Отправить заявку",
  SUBMITTING: "Отправляем…",
  CANCEL: "Отмена",
  CLOSE: "Закрыть",
  FIELD_DATE: "Дата",
  FIELD_CLOCK: "Время",
  SUBMIT_BY_KIND: { viewing: "Записаться", service: "Отправить заявку" },
  TIME_REQUIRED: "Укажите дату и время",
  SUBMIT_FALLBACK_ERROR: "Не удалось отправить заявку",
  SENT_TITLE: "Заявка отправлена",
  SENT_HINT: "Продавец ответит в течение суток — мы пришлём уведомление.",
  OPEN_REQUESTS: "Мои заявки",
};

/** Условия сделки: поля в форме объявления и строки в самом объявлении. */
export const PRODUCT_DEAL_TERMS_UI = {
  SECTION_TITLE: { service: "Условия услуги" },
  PRICE_MODE_LABEL: "Как показать цену",
  PRICE_UNIT_LABEL: "За что цена",
  PRICE_NEGOTIABLE_HINT:
    "Покупатель увидит «Договорная». Число из поля цены никому не показывается — итог вы назовёте, принимая заявку.",
  LOCATIONS_LABEL: "Где оказываете услугу",
};

/** Страница «Заявки» в профиле. */
export const DEAL_REQUESTS_PAGE_UI = {
  TITLE: "Заявки",
  LEAD: "Осмотры и услуги — сделки, которые не идут через корзину. Оплата — напрямую продавцу.",
  TABS_ARIA: "Чьи заявки показать",
  TAB_BUYER: "Мои заявки",
  TAB_SELLER: "Мне прислали",
  LOADING: "Загружаем заявки…",
  LOAD_FALLBACK_ERROR: "Не удалось загрузить заявки",
  RETRY: "Повторить",
  EMPTY_BUYER:
    "Вы ещё не оставляли заявок. Запишитесь на осмотр или закажите услугу прямо из объявления.",
  EMPTY_SELLER:
    "Заявок пока нет. Они появятся, когда покупатель запишется на осмотр или услугу.",
  LOAD_MORE: "Показать ещё",
  KIND: { viewing: "Осмотр", service: "Услуга" },
  ROLE_COUNTERPARTY: { buyer: "Продавец", seller: "Покупатель" },
  LABEL_PREFERRED: "Удобное время",
  LABEL_AGREED: "Договорились на",
  LABEL_PRICE: "Цена исполнителя",
  LABEL_ADDRESS: "Адрес",
  LABEL_COMMENT: "Комментарий",
  LABEL_DECLINE_REASON: "Причина",
  LABEL_PHONE: "Телефон",
  PHONE_LOCKED: "откроется после принятия заявки",
  PHONE_MISSING: "не указан",
  /** @param {string} time */
  EXPIRES: (time) => `Ответьте до ${time}, иначе заявка закроется`,
  /** @param {string} time */
  EXPIRES_BUYER: (time) => `Продавец ответит до ${time}`,
  OPEN_PRODUCT: "Открыть объявление",
  LEAVE_REVIEW: "Оставить отзыв",
  ACTION: {
    accept: "Принять",
    decline: "Отклонить",
    cancel: "Отменить заявку",
    confirm: "Подтвердить выполнение",
    completed: { viewing: "Сделка состоялась", service: "Услуга выполнена" },
    no_deal: "Не договорились",
    no_show: "Встреча не состоялась",
  },
  ACCEPT_TITLE: "Подтвердите время",
  ACCEPT_TIME: "Время встречи",
  ACCEPT_PRICE: "Итоговая цена, ₽",
  ACCEPT_PRICE_REQUIRED: "Назовите итоговую цену услуги",
  ACCEPT_SUBMIT: "Принять заявку",
  DECLINE_TITLE: "Почему отклоняете?",
  DECLINE_REASON_PLACEHOLDER: "Необязательно: например, уже продано",
  DECLINE_SUBMIT: "Отклонить заявку",
  FORM_CANCEL: "Назад",
  COMPLETED_VIEWING_HINT:
    "После «Сделка состоялась» объявление уйдёт с витрины, а остальные заявки на него закроются.",
  ACTION_FALLBACK_ERROR: "Не удалось выполнить действие",
};
