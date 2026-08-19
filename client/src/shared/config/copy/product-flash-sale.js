export const PRODUCT_FLASH_SALE_UI = {
  MANAGE_TITLE: "Горящая скидка",
  MANAGE_HINT: "Временная скидка с обратным отсчётом для покупателей",
  TOGGLE_PENDING: "Сохраняем…",
  MODAL_TITLE: "Горящая скидка",
  MODAL_CLOSE: "Закрыть",
  MODAL_HINT:
    "Укажите цену со скидкой и длительность. По истечении времени скидка отключится автоматически.",
  MODAL_BASE_PRICE_LABEL: "Обычная цена",
  MODAL_SALE_PRICE_LABEL: "Цена со скидкой, ₽",
  MODAL_DURATION_VALUE_LABEL: "Длительность",
  MODAL_DURATION_UNIT_LABEL: "Единица",
  MODAL_DURATION_UNIT_MINUTES: "Минуты",
  MODAL_DURATION_UNIT_HOURS: "Часы",
  MODAL_DURATION_UNIT_DAYS: "Дни",
  MODAL_SAVE: "Включить",
  MODAL_SAVE_UPDATE: "Обновить",
  MODAL_ERROR_REQUIRED: "Укажите цену и длительность",
  MODAL_ERROR_PRICE: "Цена со скидкой должна быть меньше обычной",
  MODAL_ERROR_MAX_DISCOUNT: "Скидка не более 90%",
  DETAILS_BADGE: "🔥 Горящая скидка",
  DETAILS_TITLE: "Горящая скидка",
  CATALOG_BADGE: (discountPercent) => {
    const percent = Math.floor(Number(discountPercent));
    if (Number.isFinite(percent) && percent >= 1) {
      return `🔥 Горящая −${percent}%`;
    }
    return "🔥 Горящая скидка";
  },
  DETAILS_COUNTDOWN_LABEL: "До конца акции",
  DETAILS_COUNTDOWN_EXPIRED: "Акция завершена",
  CART_PRICE_CHANGED_WARNING:
    "Цена изменилась — пересчитано по текущей стоимости товара",
};
