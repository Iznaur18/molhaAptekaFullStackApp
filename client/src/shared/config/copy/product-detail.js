// Автосгенерировано из appUiCopy.js: домен «product-detail».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Отзывы на товар */
export const PRODUCT_REVIEW_UI = {
  TAB_REVIEWS: "Отзывы",
  /** @param {number} count */
  TAB_REVIEWS_WITH_COUNT: (count) => `Отзывы (${count})`,
  SECTION_TITLE: "Отзывы",
  RATING_LINE: "★ {rating} · {count}",
  NO_REVIEWS: "Отзывов пока нет",
  YOUR_REVIEW: "Ваш отзыв",
  LEAVE_REVIEW: "Оставить отзыв",
  LABEL_RATING: "Оценка",
  LABEL_TEXT: "Текст отзыва (необязательно)",
  TEXT_PLACEHOLDER: "Что понравилось или не понравилось — по желанию",
  /** @param {number} current @param {number} max */
  TEXT_CHARS_USED: (current, max) => `${current} / ${max}`,
  SUBMIT: "Опубликовать отзыв",
  SAVE: "Сохранить",
  EDIT: "Изменить",
  CANCEL_EDIT: "Отмена",
  DELETE: "Удалить отзыв",
  LOAD_MORE: "Показать ещё",
  LOADING: "Загрузка…",
  LOGIN_TO_REVIEW: "Войдите, чтобы оставить отзыв",
  CONFIRMED_DATA_REQUIRED:
    "Отзыв доступен только пользователям с подтверждёнными данными",
  NOT_DELIVERED: "Отзыв можно оставить после получения товара",
  STAR_ARIA: "Оценка {value} из 5",
  DELETE_CONFIRM: "Удалить отзыв?",
};

/** Вопросы и ответы к товару */
export const PRODUCT_QA_UI = {
  TAB: "Вопросы и ответы",
  /** @param {number} count */
  TAB_WITH_COUNT: (count) => `Вопросы и ответы (${count})`,
  SECTION_TITLE: "Вопросы и ответы",
  ASK_TITLE: "Задать вопрос продавцу",
  ASK_PLACEHOLDER: "Ваш вопрос о товаре",
  ASK_SUBMIT: "Отправить вопрос",
  ANSWER_PLACEHOLDER: "Ваш ответ покупателю",
  ANSWER_SUBMIT: "Ответить",
  ANSWER_EDIT: "Изменить ответ",
  ANSWER_SAVE: "Сохранить ответ",
  ANSWER_CANCEL: "Отмена",
  SELLER_ANSWER_LABEL: "Ответ продавца",
  PENDING_BADGE: "Ждёт ответа",
  PENDING_HINT: "Вопрос виден только вам и продавцу, пока продавец не ответит",
  ANSWER_ACTION: "Ответить",
  HIDE_ACTION: "Скрыть",
  DELETE_ACTION: "Удалить",
  DELETE_CONFIRM: "Удалить вопрос?",
  EMPTY_STATE: "Вопросов пока нет. Будьте первым!",
  EMPTY_STATE_SELLER: "Вопросов по товару пока нет",
  LIMIT_REACHED: "Достигнут лимит вопросов по этому товару",
  LOGIN_TO_ASK: "Войдите, чтобы задать вопрос",
  LOADING: "Загрузка…",
  LOAD_MORE: "Показать ещё",
  /** @param {number} used @param {number} max */
  SLOTS_LEFT: (used, max) => `${used} / ${max}`,
  /** @param {number} current @param {number} max */
  TEXT_CHARS_USED: (current, max) => `${current} / ${max}`,
  DETAILS_TEASER_TITLE: "Написать продавцу",
  DETAILS_TEASER_SUBTITLE: "Спросить о товаре",
  DETAILS_TEASER_ARIA: "Открыть вкладку вопросов и ответов",
};

/** Предложения цены (аукцион) */
export const PRODUCT_PRICE_OFFER_UI = {
  SECTION_TOP_TITLE: "Топ ставок",
  SECTION_FORM_TITLE: "Ваша цена",
  TAB_DETAILS: "О товаре",
  TAB_AUCTION: "Аукцион",
  AUCTION_SHORTCUT: "В аукцион",
  DETAILS_TEASER_TITLE: "Аукцион",
  /** @param {string} priceLabel */
  DETAILS_TEASER_BEST_OFFER: (priceLabel) => `Топ ставка: ${priceLabel}`,
  DETAILS_TEASER_NO_OFFERS: "Топ ставка: ставок пока нет",
  DETAILS_TEASER_GO: "Предложить цену",
  DETAILS_TEASER_ARIA: "Открыть вкладку аукциона",
  LABEL_PRICE: "Ваша цена, ₽",
  INPUT_PLACEHOLDER: "Предложите свою цену",
  ERROR_PRICE_MAX: "Цена не может превышать 999 999 999 ₽",
  SUBMIT: "Предложить цену",
  UPDATE: "Изменить цену",
  CANCEL: "Отменить предложение",
  SUBMIT_LOADING: "Отправка…",
  STATUS_PENDING: "Ожидает решения продавца",
  STATUS_ACCEPTED: "Ставка принята — товар в корзине",
  STATUS_ORDERED: "Заказ по принятой цене оформлен",
  STATUS_REJECTED: "Отклонено",
  GO_TO_CART: "Перейти в корзину",
  CONFIRMED_DATA_REQUIRED: "Доступно только пользователям с подтверждёнными данными",
  CONFIRM_DATA_CTA: "Подтвердить данные",
  EMPTY_TOP: "Ставок пока нет",
  SELLER_EMPTY: "Предложений пока нет",
  SELLER_LOADING: "Загрузка…",
  AUCTION_NOT_HELD: "Аукцион не проводится",
  AUCTION_EMPTY: "Аукцион не проводится",
  AUCTION_ENDED: "Аукцион завершён",
  ARCHIVE_SECTION_TITLE: "История ставок",
  ARCHIVE_EMPTY: "Архив пуст",
  ACTION_ACCEPT: "Принять",
  ACTION_REJECT: "Отклонить",
  ACTION_PENDING: "Сохраняем…",
  ACCEPTED_BADGE: "Ожидает оплаты",
};

/** Модалка карточки товара в каталоге */
export const PRODUCT_DETAILS_MODAL_UI = {
  BACK_ARIA: "Назад",
  GALLERY_THUMBS_ARIA: "Дополнительные фотографии товара",
  OPEN_GALLERY_FULLSCREEN: "Просмотреть все фото в полном экране",
  SLIDER_REGION_ARIA: "Слайдер фотографий товара",
  DETAILS_SECTION_ARIA: "Описание и служебная информация о товаре",
  LISTING_ORIGIN_UNSPECIFIED: "Не указано",
  LISTING_ORIGIN_SLOT_ARIA: "Статус товара",
  PRICE_MARKET_STATUS_SLOT_ARIA: "Статус цены",
  PRICE_MARKET_STATUS_ABOVE: "Цена выше рыночной",
  PRICE_MARKET_STATUS_AT: "Цена по рыночной стоимости",
  PRICE_MARKET_STATUS_BELOW: "Цена ниже рыночной",
  PRICE_MARKET_STATUS_UNKNOWN: "Статус цены не определен",
  ORIGINAL_BADGE: "Оригинал",
  ORIGINAL_BADGE_ARIA: "Оригинальный товар",
  AFFILIATE_BADGE: (percent) => `Партнёрам ${percent}%`,
  AFFILIATE_SHARE: "Поделиться и заработать",
  AFFILIATE_SHARE_TITLE: "Поделиться ссылкой",
  AFFILIATE_SHARE_SUBTITLE: (percent) => `Заработать ${percent}% с покупки`,
  AFFILIATE_SHARE_LOGIN: "Войдите, чтобы делиться",
  AFFILIATE_SHARE_LOGIN_TITLE: "Войдите, чтобы делиться",
  AFFILIATE_SHARE_LOGIN_SUBTITLE: "Заработай от продажи",
  AFFILIATE_PERCENT_HINT:
    "Процент может измениться до покупки. Выплата — после подтверждения заказа.",
  CONTENT_SWITCHER_ARIA: "Описание и характеристики товара",
  DESCRIPTION_SECTION_ARIA: "Описание товара",
  SALE_CITY_ALL: "Во всех городах",
  ADDRESS_EMPTY: "Адрес не указан",
  CHARACTERISTICS_TITLE: "Характеристики",
  CHARACTERISTICS_SECTION_ARIA: "Характеристики товара",
  RETURNS_TITLE: "Возврат",
  RETURNS_SECTION_ARIA: "Условия возврата",
  RETURNS_PLACEHOLDER: "Сведения о возврате появятся позже.",
  RETURNS_NONE: "Возврат не предусмотрен.",
  DELIVERY_TITLE: "Получение",
  DELIVERY_SECTION_ARIA: "Самовывоз и доставка",
  DELIVERY_IN_DEVELOPMENT: "В разработке",
  COPY_ID_ARIA: "Скопировать ID",
  COPY_ID_DONE_ARIA: "ID скопирован",
  COPY_ID_FAILED: "Не удалось скопировать ID",
};

/** Промокоды продавца на товар */
export const PRODUCT_PROMO_CODE_UI = {
  DETAILS_BADGE: "Промокод",
  DETAILS_TEASER_TITLE: "Промокод",
  DETAILS_TEASER_SUBTITLE: "Введите код и получите скидку",
  DETAILS_TEASER_ARIA: "Открыть ввод промокода",
  SHEET_TITLE: "Промокод",
  SHEET_LEAD: "Введите код продавца. Скидка применится к этому товару.",
  CODE_LABEL: "Промокод",
  CODE_PLACEHOLDER: "например SUMMER20",
  ACTIVATE: "Активировать",
  ACTIVATE_PENDING: "Проверяем…",
  LOGIN_REQUIRED: "Войдите, чтобы активировать промокод",
  ALREADY_APPLIED: "На этот товар уже применён промокод",
  APPLIED_LABEL: "Промокод активен",
  /** @param {number} percent */
  APPLIED_PERCENT: (percent) => `−${percent}%`,
  /** @param {number} percent */
  APPLIED: (percent) => `Промокод активен: −${percent}%`,
  MODAL_TITLE: "Промокоды товара",
  MODAL_LEAD: "До 10 активных кодов. Скидка только в процентах. Лимит активаций — от 1 до 1000.",
  /** @param {number} n */
  CARD_TITLE: (n) => `Промокод ${n}`,
  ADD: "Добавить промокод",
  SAVE: "Сохранить",
  SAVE_PENDING: "Сохранение…",
  CLOSE: "Закрыть",
  FIELD_CODE: "Код",
  FIELD_PERCENT: "Скидка, %",
  FIELD_MAX: "Макс. активаций",
  FIELD_USED: "Использовано",
  FIELD_ENABLED: "Активен",
  REMOVE: "Удалить",
  EMPTY: "Пока нет промокодов",
  MAX_ACTIVE: "Уже 10 активных промокодов",
  CART_PROMO_LABEL: "Промокод",
  /** @param {number} percent */
  CART_PROMO_PERCENT: (percent) => `−${percent}%`,
  FETCH_FALLBACK: "Не удалось загрузить промокоды",
  SAVE_FALLBACK: "Не удалось сохранить промокоды",
  ACTIVATE_FALLBACK: "Не удалось активировать промокод",
};

/** Оптовая цена (карточка / детали) */
export const PRODUCT_WHOLESALE_UI = {
  DETAILS_OFFER_KICKER: "Оптовая цена",
  DETAILS_OFFER_UNIT: "/ шт.",
  /** @param {number} minQty */
  DETAILS_OFFER_FROM_QTY: (minQty) => `от ${minQty} шт.`,
  /**
   * @param {number} minQty
   * @param {string} priceLabel
   * @param {number} percent
   */
  DETAILS_OFFER_SUBTITLE: (minQty, priceLabel, percent) =>
    `от ${minQty} шт. ${priceLabel} (−${percent}%)`,
  /** @param {string} savingsLabel */
  DETAILS_OFFER_SAVINGS: (savingsLabel) => `экономия ${savingsLabel} с единицы`,
  /** @param {number} percent */
  DETAILS_OFFER_DISCOUNT: (percent) => `−${percent}%`,
  DETAILS_OFFER_GO: "Купить оптом",
  DETAILS_OFFER_GO_ARIA: "Добавить в корзину по оптовой цене",
  DETAILS_OFFER_ARIA: "Доступна оптовая цена",
};

/** Описания бейджей в деталях товара (CMS + sheet). */
export const PRODUCT_BADGE_EXPLAIN_UI = {
  CLOSE: "Понятно",
  CONTACT: "Связаться",
  CONTACT_PENDING: "Загрузка…",
  CONTACT_ERROR: "Не удалось показать номер",
  ARIA_DIALOG: "Описание бейджа",
  FALLBACK: {
    original:
      "Продавец отметил товар как оригинал. Это заявление продавца, а не проверка площадки.",
    raffle:
      "Товар участвует в розыгрыше продавца. Правила и приз смотрите в карточке розыгрыша на главной.",
    affiliate:
      "По этому товару доступна партнёрская комиссия. Процент указан на бейдже.",
    listing_origin_own:
      "Продавец указал, что продаёт собственную вещь, а не товар для перепродажи.",
    listing_origin_resale:
      "Продавец указал, что товар приобретён для перепродажи.",
    listing_origin_manufacturer:
      "Продавец указал, что является производителем этого товара.",
    listing_origin_unspecified:
      "Продавец не указал статус происхождения товара.",
    price_market_above:
      "По оценке продавца цена выше типичной рыночной стоимости.",
    price_market_at:
      "По оценке продавца цена соответствует рыночной стоимости.",
    price_market_below:
      "По оценке продавца цена ниже типичной рыночной стоимости.",
    discount: "На товар действует скидка относительно старой цены.",
    loyalty:
      "За покупку можно получить баллы лояльности. Баллы даёт продавец; получает подтверждённый покупатель.",
    auction:
      "Продавец принимает предложения цены по этому товару. Условия и ставки — во вкладке «Аукцион».",
    installment:
      "Товар можно купить в рассрочку у продавца. Условия и оформление — во вкладке «Рассрочка».",
    wholesale:
      "При покупке от указанного количества действует оптовая цена за единицу. Подробности — в блоке оптовой цены на этой странице.",
    rental:
      "Товар можно взять в аренду у продавца. Цена и единица (сутки или час) задаются продавцом. Условия выдачи и возврата уточняйте у продавца.",
    promo:
      "Продавец задал промокоды на этот товар. Введите код в блоке «Промокод», чтобы получить скидку в процентах.",
    near_distance:
      "Примерное расстояние до пункта самовывоза продавца относительно вашего местоположения. Точность зависит от геолокации.",
    profile_address:
      "Укажите адрес в профиле — так проще находить товары рядом и оформлять доставку.",
  },
};
