/** Панель админа: какие службы доставки предлагать продавцам. */
export const SHIPPING_CARRIERS_ADMIN_UI = {
  TITLE: "Службы доставки",
  INTRO:
    "Выключенную службу продавец не выберет на товаре, а покупатель не увидит на оформлении. Уже оформленные заказы это не трогает.",
  LOADING: "Загрузка…",
  EMPTY: "Служб доставки нет.",
  STATE_ON: "Включена",
  STATE_OFF: "Выключена",
  ACTION_ENABLE: "Включить",
  ACTION_DISABLE: "Выключить",
  SAVING: "Сохраняем…",
  NOT_CONFIGURED: "Нет ключей API — включать нечего",
  /** @param {string[]} regions */
  REGIONS: (regions) => `Только: ${regions.join(", ")}`,
  REGIONS_ALL: "Вся страна",
  ERROR_GENERIC: "Не удалось выполнить действие. Попробуйте ещё раз.",
};
