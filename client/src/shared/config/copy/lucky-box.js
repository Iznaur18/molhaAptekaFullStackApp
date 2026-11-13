// Домен «lucky-box»: игра «Коробки удачи» на витрине продавца.
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Блок игры на витрине продавца */
export const LUCKY_BOX_SECTION_UI = {
  TITLE: "Коробки удачи",
  /**
   * @param {number} prizesCount — сколько коробок с призом (1..4)
   */
  SUBTITLE: (prizesCount) => {
    const word = { 1: "одна", 2: "две", 3: "три", 4: "четыре" }[prizesCount];
    return word
      ? `Откройте коробку — среди шести спрятаны ${word} со скидкой`
      : "Откройте коробку — среди шести есть коробки со скидкой";
  },
  ATTEMPT_HINT: "Две попытки в день: вторая — если первая оказалась пустой",
  BUTTON_HINT: "Выигрывайте призы",
  SECOND_ATTEMPT_HINT: "Пусто — но у вас есть ещё одна попытка!",
  LOGIN_TEASER: "Войдите, чтобы открыть коробку и выиграть скидку у этого продавца",
  LOGIN_BUTTON: "Войти",
  BOX_ARIA: (index) => `Коробка ${index + 1}`,
  /** @param {number} left @param {number} total */
  ATTEMPTS_ARIA: (left, total) => `Осталось попыток: ${left} из ${total}`,
  /** Надпись на открытой коробке без приза. */
  BOX_EMPTY_FACE: "пусто",
  /** Подпись на призовой коробке с товаром вместо скидки. */
  BOX_PRODUCT_FACE: "🎁",
  /** Подпись над процентом на призовой коробке. */
  BOX_PRIZE_LABEL: "скидка",
  OPENING: "Открываем…",
  /** @param {number} percent */
  WIN_TITLE: (percent) => `Скидка ${percent}% — ваша!`,
  WIN_APPLIES: "Применится автоматически к заказу у этого продавца",
  /** @param {string} time — локальное время истечения, напр. «14:30» */
  WIN_EXPIRES: (time) => `Действует до ${time}`,
  EMPTY_TITLE: "Пусто",
  EMPTY_HINT: "Сегодня не повезло. Приходите завтра — коробки перемешаются",
  PLAYED_WIN_TITLE: (percent) => `Сегодня вы выиграли скидку ${percent}%`,
  PLAYED_EMPTY_TITLE: "Сегодня выпала пустая коробка",
  PLAYED_HINT: "Новая попытка — завтра",
  /** @param {number} percent */
  ACTIVE_WIN_NOTICE: (percent) =>
    `У вас активна скидка ${percent}% — применится автоматически при оформлении заказа`,
  /** Заголовок выигрыша товара. @param {string} productName */
  WIN_PRODUCT_TITLE: (productName) => `Товар в подарок: ${productName}`,
  WIN_PRODUCT_APPLIES: "Добавим бесплатно в ваш заказ у этого продавца",
  /** Чип в списке призов для коробки с товаром. */
  PRIZE_CHIP_PRODUCT: "Товар",
  /** @param {string} productName */
  PLAYED_PRODUCT_WIN_TITLE: (productName) =>
    `Сегодня вы выиграли товар: ${productName}`,
  /** @param {string} productName */
  ACTIVE_PRODUCT_WIN_NOTICE: (productName) =>
    `У вас выигран товар «${productName}» — добавим бесплатно к заказу у этого продавца`,
  LOAD_FALLBACK: "Не удалось загрузить игру",
  PLAY_FALLBACK: "Не удалось открыть коробку",
  CLOSE: "Закрыть",
  /** Метка строки корзины со скидкой из игры (вместо «Промокод»). */
  CART_LINE_LABEL: "Коробки удачи",
  /** Бейдж строки корзины с товаром-призом. */
  CART_PRODUCT_BADGE: "Приз",
};

/** Карточка настройки в разделе «Реклама» */
export const LUCKY_BOX_ADVERTISING_UI = {
  CARD_TITLE: "Коробки удачи",
  CARD_BADGE: "игра",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить настройки «Коробок удачи»",
  SAVE_FALLBACK: "Не удалось сохранить настройки",
  SAVE_SUCCESS: "Настройки сохранены",
  DESCRIPTION:
    "Покупатель раз в день открывает до двух коробок на вашей витрине: вторая попытка даётся, если первая оказалась пустой. В призовых — скидка, которую вы задаёте ниже; в остальных — пусто. Скидка применяется автоматически при оформлении заказа.",
  ENABLED_LABEL: "Игра включена на витрине",
  PRIZES_COUNT_LABEL: "Количество призов",
  /** @param {number} index */
  PRIZE_TITLE: (index) => `Приз ${index + 1}`,
  /** @param {number} index */
  PRIZE_TOGGLE_ARIA: (index) => `Приз ${index + 1}: включить или выключить`,
  DISCOUNT_LABEL: "Скидка, %",
  DURATION_LABEL: "Действует, часов",
  DISCOUNT_HINT: "от 1 до 90",
  DURATION_HINT: "от 1 до 24",
  PRIZE_PRODUCT_LABEL: "ID товара-приза",
  PRIZE_PRODUCT_PLACEHOLDER: "например, 6af37f11c74c503a1b4267ef",
  PRIZE_PRODUCT_HINT:
    "если указан — призом будет этот товар (бесплатно), а не скидка; товар должен быть вашим",
  SAVE: "Сохранить",
  SAVING: "Сохраняем…",
  /** @param {number} plays @param {number} wins */
  STATS: (plays, wins) => `Открыто коробок: ${plays}, призов выиграно: ${wins}`,
  /* --- Конструктор (простой режим) --- */
  BUILDER_HINT:
    "Нажмите на коробку, чтобы сделать её призовой или пустой — так, как увидит покупатель.",
  BUILDER_PALETTE_LABEL: "Скидка в выбранной коробке:",
  BUILDER_SELECT_BOX: "Сначала выберите коробку выше",
  BUILDER_EMPTY_CHIP: "пусто",
  BUILDER_NOTE:
    "Скидка действует 24 часа. Срок действия и товар-приз — в расширенной настройке.",
  MODE_ADVANCED: "Расширенная настройка",
  MODE_BUILDER: "Вернуться к конструктору",
  /** @param {number} index @param {number} discount */
  BUILDER_BOX_PRIZE_ARIA: (index, discount) =>
    `Коробка ${index + 1}: призовая, скидка ${discount}%`,
  /** @param {number} index */
  BUILDER_BOX_EMPTY_ARIA: (index) =>
    `Коробка ${index + 1}: пустая, нажмите, чтобы сделать призовой`,
  BUILDER_PRIZE_FACE_LABEL: "скидка",
  BUILDER_EMPTY_FACE_LABEL: "пусто",
};
