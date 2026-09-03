export const ONEC_INTEGRATION_PAGE_UI = {
  TITLE: "Интеграция с 1С",
  LEAD:
    "Товары, цены и остатки приходят из 1С, а заказы клиентов уходят обратно как «Заказ покупателя».",
  AUTH_REQUIRED: "Войдите, чтобы настроить интеграцию с 1С",
  LOGIN_BUTTON: "Войти",

  CHANNEL_TITLE: "Как обмениваемся",
  CHANNEL_COMMERCEML: "1С сама шлёт на сайт (CommerceML)",
  CHANNEL_COMMERCEML_HINT:
    "Штатный «Обмен с сайтом» в УТ 11, Рознице и Бухгалтерии — настраивается галочками, без доработки конфигурации. Рекомендуемый способ.",
  CHANNEL_PULL: "Сайт сам ходит в 1С (HTTP-сервис)",
  CHANNEL_PULL_HINT:
    "Нужен HTTP-сервис в вашей конфигурации и его публикация наружу. Подойдёт, если сервис уже написан.",

  LABEL_ENABLED: "Обмен включён",
  LABEL_BASE_URL: "URL HTTP-сервиса 1С",
  PLACEHOLDER_BASE_URL: "https://ваш-сервер/onec-api",
  LABEL_API_KEY: "API-ключ",
  PLACEHOLDER_API_KEY: "Вставьте ключ (сохраняется в зашифрованном виде)",
  HINT_API_KEY_SET: "Ключ сохранён:",
  HINT_LEAVE_KEY: "Оставьте поле пустым, чтобы не менять сохранённый ключ.",

  ACCESS_TITLE: "Доступы для 1С",
  ACCESS_HINT:
    "Вставьте эти три значения в узел обмена 1С: Администрирование → Синхронизация данных → Обмен с сайтом.",
  LABEL_ENDPOINT: "Адрес обмена",
  LABEL_LOGIN: "Логин",
  LABEL_PASSWORD: "Пароль",
  GENERATE_CREDENTIALS: "Сгенерировать логин и пароль",
  REGENERATE_CREDENTIALS: "Перевыпустить пароль",
  GENERATE_PENDING: "Генерируем…",
  PASSWORD_ONCE:
    "Пароль показан один раз — скопируйте его сейчас. Потом останется только перевыпустить.",
  NO_CREDENTIALS: "Доступы ещё не выданы",
  COPY: "Копировать",
  COPIED: "Скопировано",

  FILTERS_TITLE: "Что выгружать на витрину",
  PRICE_TYPES_LABEL: "Типы цен",
  PRICE_TYPES_EMPTY:
    "Типы цен появятся после первой выгрузки из 1С. Пока берём первую цену из файла.",
  WAREHOUSES_LABEL: "Склады",
  WAREHOUSES_EMPTY:
    "Склады появятся после первой выгрузки. Пока суммируем остатки по всем.",
  FILTERS_HINT:
    "Ничего не отмечено — берём первую попавшуюся цену и сумму по всем складам.",

  MAPPING_TITLE: "Категории 1С → категории сайта",
  MAPPING_HINT:
    "Пока группа не сопоставлена, её товары не попадают в каталог. Подгруппы наследуют категорию родителя, если у них не задана своя.",
  MAPPING_EMPTY:
    "Группы номенклатуры появятся здесь после первой выгрузки каталога из 1С.",
  MAPPING_SEARCH_PLACEHOLDER: "Начните вводить категорию сайта…",
  MAPPING_NOT_SET: "Не сопоставлено",
  MAPPING_CLEAR: "Убрать",
  MAPPING_SAVE: "Сохранить сопоставления",
  MAPPING_SAVE_PENDING: "Сохраняем…",
  MAPPING_PRODUCTS: (count) => `Товаров: ${count}`,
  MAPPING_UNMAPPED_COUNT: (count) => `Не сопоставлено групп: ${count}`,
  MAPPING_NOTHING_PICKED:
    "Кнопка станет активной, когда выберете категорию: нажмите «Не сопоставлено», введите 2+ буквы и кликните по варианту из списка.",
  MAPPING_PENDING_COUNT: (count) =>
    `Готово к сохранению: ${count}. Нажмите «Сохранить сопоставления».`,

  IMPORTS_TITLE: "Приёмка файлов из 1С",
  IMPORTS_EMPTY: "1С ещё ничего не присылала",
  IMPORT_STATUS: {
    pending: "в очереди",
    processing: "разбираем",
    completed: "готово",
    failed: "ошибка",
  },
  IMPORT_CREATED: "создано",
  IMPORT_UPDATED: "обновлено",
  IMPORT_UNCATEGORIZED: "без категории",
  IMPORT_IMAGES: "картинок залито",
  IMPORT_DEACTIVATED: "снято с витрины",
  IMPORT_HELD: "отложено без картинок и остатка",
  IMPORT_RESTORED: "возвращено с остатком",
  IMPORT_ISSUES: "Замечания",
  IMPORT_HOLD_HINT:
    "Номенклатура без картинок и без остатка на сайт не заводится. Как только в выгрузке появится остаток или картинка, товар создастся сам.",

  SAVE: "Сохранить",
  SAVE_PENDING: "Сохраняем…",
  TEST: "Проверить соединение",
  TEST_PENDING: "Проверяем…",
  SYNC: "Обменять сейчас",
  SYNC_PENDING: "Обмен…",
  DISCONNECT: "Отключить 1С",
  DISCONNECT_CONFIRM: "Отключить интеграцию?",
  STATUS_IDLE: "Ещё не было обмена",
  STATUS_SUCCESS: "Последний обмен успешен",
  STATUS_ERROR: "Последний обмен с ошибкой",
  LOGS_TITLE: "Журнал обмена",
  LOGS_EMPTY: "Записей пока нет",
  LOADING: "Загрузка…",
  MOCK_HINT:
    "Локальный тест канала «сайт ходит в 1С»: в папке server выполните npm run onec:mock, URL http://127.0.0.1:3091, ключ mock-onec-key",
};
