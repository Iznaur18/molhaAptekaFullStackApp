export const API_CLIENT_UI = {
  INVALID_SERVER_RESPONSE: "Неверный ответ сервера",
  FETCH_ME_FALLBACK: "Не удалось загрузить профиль",
  FETCH_PRODUCTS_FALLBACK: "Не удалось загрузить каталог",
  FETCH_CATALOG_PRODUCT_FALLBACK: "Не удалось загрузить товар",
  LOGIN_FALLBACK: "Не удалось войти",
  REGISTER_FALLBACK: "Не удалось зарегистрироваться",
  LOGOUT_FALLBACK: "Не удалось выйти",
  NETWORK_ERROR: "Нет подключения к интернету",
  TIMEOUT_ERROR: "Превышено время ожидания ответа",
  API_URL_MISSING: "Не задан EXPO_PUBLIC_API_URL",
  CATALOG_EMPTY: "Товаров пока нет",
  CATALOG_ERROR: "Ошибка загрузки каталога",
  FETCH_CART_FALLBACK: "Не удалось загрузить корзину",
  REPLACE_CART_FALLBACK: "Не удалось обновить корзину",
  CREATE_ORDER_FALLBACK: "Не удалось оформить заказ",
  FETCH_ADDRESS_SUGGESTIONS_FALLBACK: "Не удалось загрузить подсказки адреса",
  FETCH_CATEGORY_DISPLAYS_FALLBACK: "Не удалось загрузить категории",
  FETCH_MY_ORDERS_FALLBACK: "Не удалось загрузить заказы",
  FETCH_CATEGORY_CHILDREN_FALLBACK: "Не удалось загрузить подкатегории",
  UPDATE_ORDER_STATUS_FALLBACK: "Не удалось обновить заказ",
  SUBMIT_PRODUCT_REPORT_FALLBACK: "Не удалось отправить жалобу",
  FETCH_PRODUCT_REPORT_STATUS_FALLBACK: "Не удалось проверить жалобу",
  UPDATE_PROFILE_FALLBACK: "Не удалось сохранить профиль",
  UPLOAD_IMAGE_FALLBACK: "Не удалось загрузить файл",
} as const;

export const IMAGE_UPLOAD_UI = {
  UPLOAD_BUTTON: "Выбрать фото",
  UPLOAD_LOADING: "Загрузка…",
  UPLOAD_HINT: "JPEG, PNG или WebP, до 5 МБ",
  ERROR_TYPE: "Допустимы только JPEG, PNG и WebP",
  ERROR_SIZE: "Файл не больше 5 МБ",
  ERROR_GENERIC: "Не удалось загрузить файл",
  ERROR_AUTH: "Войдите в аккаунт, чтобы загрузить файл",
  PERMISSION_DENIED: "Нет доступа к галерее",
} as const;

export const SCREEN_STATE_UI = {
  RETRY: "Повторить",
} as const;

export const EDIT_PROFILE_UI = {
  TITLE: "Редактирование профиля",
  EDIT_BUTTON: "Редактировать профиль",
  LABEL_EMAIL: "Email (нельзя изменить)",
  LABEL_USERNAME: "Никнейм",
  USERNAME_HINT: "Только a–z и 0–9, без пробелов, 3–30 символов",
  LABEL_PHONE: "Телефон",
  LABEL_AVATAR: "Аватар",
  LABEL_NOTIFICATIONS: "Уведомления по email",
  SUBMIT: "Сохранить",
  SAVED: "Профиль сохранён",
  SAVE_ERROR: "Не удалось сохранить",
  NOTHING_TO_SAVE: "Нет изменений для сохранения",
  AUTH_REQUIRED: "Войдите, чтобы редактировать профиль",
} as const;

export const ADD_TO_CART_UI = {
  ADD: "В корзину",
  LOGIN_TO_ADD: "Войти, чтобы добавить",
  DECREASE_ARIA: "Уменьшить количество",
  INCREASE_ARIA: "Увеличить количество",
  QUANTITY_ARIA: "Количество в корзине",
} as const;

export const CART_PAGE_UI = {
  TITLE: "Корзина",
  EMPTY: "Корзина пуста",
  LOADING: "Загрузка корзины…",
  TOTAL_LABEL: "Итого",
  REMOVE_LINE_ARIA: "Удалить из корзины",
  CLEAR_ALL: "Очистить корзину",
  GO_TO_CATALOG: "Перейти в каталог",
  AUTH_REQUIRED: "Войдите, чтобы пользоваться корзиной",
  AUTH_LOGIN: "Войти",
  PRODUCT_DELETED_OR_HIDDEN: "Товар недоступен",
} as const;

export const PRODUCT_UI = {
  NO_IMAGE: "Нет фото",
  UNAVAILABLE: "Нет в наличии",
  OPEN_ARIA: (name?: string) => `Открыть ${name ?? "товар"}`,
  DESCRIPTION_TITLE: "Описание",
  SELLER_TITLE: "Продавец",
  NO_DESCRIPTION: "Описание не указано",
  UNKNOWN_SELLER: "Продавец",
} as const;

export const CHECKOUT_FORM_UI = {
  HEADING: "Оформление заказа",
  LABEL_DELIVERY_ADDRESS: "Адрес доставки",
  PLACEHOLDER_DELIVERY_ADDRESS: "Город, улица, дом",
  LABEL_FLAT: "Квартира / офис",
  PLACEHOLDER_FLAT: "Необязательно",
  LABEL_PAYMENT_METHOD: "Способ оплаты",
  SUBMIT_IDLE: "Оформить заказ",
  SUBMIT_LOADING: "Оформляем…",
  SUCCESS: "Заказ успешно оформлен",
  ERROR_GENERIC: "Не удалось оформить заказ",
} as const;

export const ADDRESS_DELIVERY_UI = {
  LABEL_LINE: "Адрес доставки",
  SUGGESTIONS_LOADING: "Загрузка подсказок…",
  NO_SUGGESTIONS: "Ничего не найдено",
} as const;

export const CATALOG_FILTER_UI = {
  SEARCH_PLACEHOLDER: "Поиск товаров",
  ALL_CATEGORIES: "Все",
  ALL_IN_CATEGORY: "Вся категория",
  CLEAR_SEARCH: "Очистить",
} as const;

export const ORDER_CARD_UI = {
  ITEMS_HEADING: "Позиции",
  ADDRESS_LABEL: "Адрес доставки",
  PAYMENT_LABEL: "Оплата",
  CREATED_LABEL: "Создан",
  ITEM_STATUS_LABEL: "Статус позиции",
  ACTION_CONFIRM: "Подтвердить получение",
  ACTION_CANCEL: "Отменить",
  ACTION_PENDING: "Сохраняем…",
  BUYER_CANCEL_CONFIRM: "Отменить заказ?",
} as const;

export const PRODUCT_REPORT_UI = {
  REPORT_BUTTON: "Пожаловаться",
  MODAL_TITLE: "Пожаловаться на товар",
  LABEL_TEXT: "Опишите причину",
  PLACEHOLDER: "Текст жалобы…",
  SUBMIT: "Отправить",
  SUBMIT_LOADING: "Отправка…",
  CANCEL: "Отмена",
  ALREADY_REPORTED: "Жалоба уже отправлена",
  SUCCESS: "Жалоба принята",
  LOGIN_REQUIRED: "Войдите, чтобы пожаловаться",
  CHARS_USED: (current: number, max: number) => `${current} / ${max} символов`,
} as const;

export const PRODUCT_REPORT_TEXT_MAX_CHARS = 1000;

export const MY_ORDERS_PAGE_UI = {
  TITLE: "Мои заказы",
  LOADING: "Загрузка заказов…",
  EMPTY: "У вас пока нет заказов",
  AUTH_REQUIRED: "Войдите, чтобы видеть заказы",
  LOYALTY_POINTS_EARNED: (points: number) => `+${points} баллов лояльности`,
} as const;

export const EMAIL_VERIFICATION_UI = {
  BANNER: "Подтвердите email, чтобы оформлять заказы",
  OPEN_BUTTON: "Подтвердить email",
  MODAL_TITLE: "Подтверждение email",
  MODAL_TEXT: (email: string) => `Введите 6-значный код, отправленный на ${email}`,
  LABEL_CODE: "Код из письма",
  CODE_PLACEHOLDER: "000000",
  CODE_REQUIRED: "Введите 6-значный код",
  CONFIRM_BUTTON: "Подтвердить",
  CONFIRM_LOADING: "Проверка…",
  CONFIRM_ERROR: "Не удалось подтвердить email",
  RESEND_BUTTON: "Отправить код повторно",
  RESEND_LOADING: "Отправка…",
  RESENT: "Письмо отправлено",
  RESEND_ERROR: "Не удалось отправить письмо",
  VERIFIED_SUCCESS: "Email подтверждён",
  CLOSE: "Закрыть",
} as const;

export const AUTH_UI = {
  LOGIN_TITLE: "Вход",
  REGISTER_TITLE: "Регистрация",
  EMAIL_LABEL: "Email",
  PASSWORD_LABEL: "Пароль",
  PASSWORD_CONFIRM_LABEL: "Повторите пароль",
  USER_NAME_LABEL: "Имя пользователя",
  LOGIN_BUTTON: "Войти",
  REGISTER_BUTTON: "Зарегистрироваться",
  LOGOUT_BUTTON: "Выйти",
  GO_TO_REGISTER: "Создать аккаунт",
  GO_TO_LOGIN: "Уже есть аккаунт? Войти",
  GUEST_STATUS: "Вы не вошли в аккаунт",
  PROFILE_TITLE: "Профиль",
  SESSION_CHECK: "Проверка сессии…",
  SESSION_ERROR: "Ошибка сессии",
} as const;
