/** Подключение СДЭК в настройках продавца. */
export const CDEK_CONNECTION_UI = {
  TITLE: "Доставка СДЭК",
  SUBTITLE:
    "Отправления идут по вашему договору со СДЭК и оплачиваются с него же. Площадка ключи не видит и за отправки не платит.",
  HOW_TO: "Где взять: кабинет СДЭК → «Интеграция» → создать ключ.",
  HOW_TO_LINK: "https://lk.cdek.ru/integration",
  ACCOUNT_LABEL: "Account (логин интеграции)",
  SECURE_LABEL: "Secure password (секретный ключ)",
  ENVIRONMENT_LABEL: "Контур",
  ENVIRONMENT_TEST: "Тестовый — отправления не создаются по-настоящему",
  ENVIRONMENT_PROD: "Боевой — реальные отправления и деньги",
  SUBMIT: "Подключить СДЭК",
  SUBMIT_PENDING: "Проверяем ключи…",
  DISCONNECT: "Отключить",
  DISCONNECT_PENDING: "Отключаем…",
  CONNECTED: "СДЭК подключён",
  NOT_CONNECTED: "СДЭК не подключён",
  CHECKED_AT: "Ключи проверены",
  SECURE_HINT:
    "Ключ хранится зашифрованным: ни в списке заказов, ни в ответах сайта он не появляется.",
  REPLACE_HINT: "Чтобы заменить ключ, введите новую пару и сохраните.",
  TOGGLE_LABEL: "Продавать через СДЭК",
  TOGGLE_ON_HINT: "Покупатели видят СДЭК среди служб доставки ваших товаров",
  TOGGLE_OFF_HINT:
    "СДЭК скрыт от покупателей. Уже оформленные заказы это не затрагивает",
};

/** Накладная СДЭК в карточке продажи. */
export const CDEK_WAYBILL_UI = {
  TITLE: "Накладная СДЭК",
  PICKUP_POINT: "Покупатель заберёт в пункте",
  DELIVERY_PAID_BY_BUYER: "Доставку покупатель оплатит в пункте",
  RECEPTION_CITY_LABEL: "Город, где сдадите посылку",
  RECEPTION_CITY_PLACEHOLDER: "Например, Грозный",
  RECEPTION_SEARCH: "Найти пункты",
  RECEPTION_SEARCH_PENDING: "Ищем…",
  RECEPTION_POINT_LABEL: "Пункт СДЭК, куда отвезёте посылку",
  RECEPTION_POINT_PLACEHOLDER: "Выберите пункт",
  RECEPTION_EMPTY: "В этом городе СДЭК не нашёл пунктов приёма",
  DOOR_HINT: "Курьер СДЭК заберёт посылку по адресу из карточки товара",
  CREATE: "Создать накладную",
  CREATE_PENDING: "Создаём…",
  NUMBER: "Номер СДЭК",
  NUMBER_PENDING: "СДЭК ещё присваивает номер — обновите через минуту",
  STATUS: "Статус",
  REFRESH: "Обновить статус",
  REFRESH_PENDING: "Обновляем…",
  REJECTED: "СДЭК отклонил накладную",
};
