// Домен «fortune-wheel»: игра «Колесо фортуны» на витрине продавца.
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Блок игры на витрине продавца */
export const FORTUNE_WHEEL_SECTION_UI = {
  TITLE: "Колесо фортуны",
  SUBTITLE: "Один спин в день — какая скидка выпадет сегодня?",
  BUTTON_HINT: "Испытайте удачу",
  SPIN: "Крутить",
  SPINNING: "Крутим…",
  SPIN_ARIA: "Крутить колесо фортуны",
  LOGIN_TEASER: "Войдите, чтобы крутить колесо и выиграть скидку у этого продавца",
  LOGIN_BUTTON: "Войти",
  /** Подпись пустой секции на колесе. */
  SECTOR_EMPTY_FACE: "пусто",
  /** Подпись секции с товаром-призом на колесе. */
  SECTOR_PRODUCT_FACE: "🎁",
  /** @param {number} percent */
  WIN_TITLE: (percent) => `Скидка ${percent}% — ваша!`,
  WIN_APPLIES: "Применится автоматически к заказу у этого продавца",
  /** @param {string} time — локальное время истечения, напр. «14:30» */
  WIN_EXPIRES: (time) => `Действует до ${time}`,
  EMPTY_TITLE: "Пусто",
  EMPTY_HINT: "Сегодня не повезло. Приходите завтра — колесо снова ждёт",
  PRIZES_TITLE: "Что можно выиграть:",
  /** @param {number} percent @param {number} hours */
  PRIZE_CHIP: (percent, hours) => `${percent}% · ${hours} ч`,
  PLAYED_WIN_TITLE: (percent) => `Сегодня вы выиграли скидку ${percent}%`,
  PLAYED_EMPTY_TITLE: "Сегодня колесо остановилось на «пусто»",
  PLAYED_HINT: "Новый спин — завтра",
  /** @param {number} percent */
  ACTIVE_WIN_NOTICE: (percent) =>
    `У вас активна скидка ${percent}% — применится автоматически при оформлении заказа`,
  /** Заголовок выигрыша товара. @param {string} productName */
  WIN_PRODUCT_TITLE: (productName) => `Товар в подарок: ${productName}`,
  WIN_PRODUCT_APPLIES: "Добавим бесплатно в ваш заказ у этого продавца",
  /** Чип в списке «Что можно выиграть» для секции с товаром. */
  PRIZE_CHIP_PRODUCT: "Товар",
  /** @param {string} productName */
  PLAYED_PRODUCT_WIN_TITLE: (productName) =>
    `Сегодня вы выиграли товар: ${productName}`,
  /** @param {string} productName */
  ACTIVE_PRODUCT_WIN_NOTICE: (productName) =>
    `У вас выигран товар «${productName}» — добавим бесплатно к заказу у этого продавца`,
  LOAD_FALLBACK: "Не удалось загрузить игру",
  SPIN_FALLBACK: "Не удалось крутить колесо",
  CLOSE: "Закрыть",
  /** Метка строки корзины со скидкой из игры (вместо «Промокод»). */
  CART_LINE_LABEL: "Колесо фортуны",
  /** Бейдж строки корзины с товаром-призом. */
  CART_PRODUCT_BADGE: "Приз",
};

/** Карточка настройки в разделе «Реклама» */
export const FORTUNE_WHEEL_ADVERTISING_UI = {
  CARD_TITLE: "Колесо фортуны",
  CARD_BADGE: "игра",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить настройки «Колеса фортуны»",
  SAVE_FALLBACK: "Не удалось сохранить настройки",
  SAVE_SUCCESS: "Настройки сохранены",
  DESCRIPTION:
    "Покупатель раз в день крутит колесо на вашей витрине и выигрывает скидку из выпавшей секции — или «пусто». Вы задаёте секции, шанс выпадения каждой и размер скидки. Скидка применяется автоматически при оформлении заказа.",
  ENABLED_LABEL: "Игра включена на витрине",
  SECTORS_COUNT_LABEL: "Количество секций",
  /** @param {number} index */
  SECTOR_TITLE: (index) => `Секция ${index + 1}`,
  /** @param {number} index */
  SECTOR_TOGGLE_ARIA: (index) => `Секция ${index + 1}: приз или «пусто»`,
  DISCOUNT_LABEL: "Скидка, %",
  DURATION_LABEL: "Действует, часов",
  CHANCE_LABEL: "Шанс, %",
  DISCOUNT_HINT: "от 1 до 90",
  DURATION_HINT: "от 1 до 24",
  CHANCE_HINT: "сумма шансов всех секций — ровно 100",
  PRIZE_PRODUCT_LABEL: "ID товара-приза",
  PRIZE_PRODUCT_PLACEHOLDER: "например, 6af37f11c74c503a1b4267ef",
  PRIZE_PRODUCT_HINT:
    "если указан — призом будет этот товар (бесплатно), а не скидка; товар должен быть вашим",
  /** @param {number} total */
  CHANCE_TOTAL_OK: (total) => `Сумма шансов: ${total}% — всё сходится`,
  /** @param {number} total */
  CHANCE_TOTAL_ERROR: (total) => `Сумма шансов: ${total}% — нужно ровно 100%`,
  SAVE: "Сохранить",
  SAVING: "Сохраняем…",
  /** @param {number} spins @param {number} wins */
  STATS: (spins, wins) => `Крутили колесо: ${spins}, призов выиграно: ${wins}`,
  /* --- Конструктор (простой режим) --- */
  BUILDER_HINT:
    "Нажмите на секцию колеса и выберите её приз — шансы пересчитаются сами.",
  /** @param {number} index */
  BUILDER_PALETTE_LABEL: (index) => `Секция ${index + 1} — приз:`,
  BUILDER_SELECT_SECTOR: "Сначала выберите секцию на колесе",
  BUILDER_EMPTY_CHIP: "пусто",
  BUILDER_ADD_SECTOR: "+ Добавить секцию",
  BUILDER_REMOVE_SECTOR: "Удалить секцию",
  /** @param {number} percent */
  BUILDER_CHANCE_INFO: (percent) =>
    `Каждая секция выпадает с шансом ~${percent}% — сумма всегда 100%`,
  BUILDER_NOTE:
    "Скидка действует 24 часа. Свои шансы, сроки и товар-приз — в расширенной настройке.",
  MODE_ADVANCED: "Расширенная настройка",
  MODE_BUILDER: "Вернуться к конструктору",
  /** @param {number} index @param {number | null} discount */
  BUILDER_SECTOR_ARIA: (index, discount) =>
    discount === null
      ? `Секция ${index + 1}: пусто`
      : `Секция ${index + 1}: скидка ${discount}%`,
};
