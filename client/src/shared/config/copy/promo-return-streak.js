export const PROMO_RETURN_STREAK_DOCK_UI = {
  TITLE: "Скидка за возвращение",
  EYEBROW: "Серия",
  /** @param {number} day @param {number} maxDay */
  DAY: (day, maxDay) => `День ${day} из ${maxDay}`,
  /** @param {number} day @param {number} maxDay */
  DAY_BOLD: (day, maxDay) => `${day} / ${maxDay}`,
  /** @param {number} day */
  DAY_TICK: (day) => `Д${day}`,
  /** @param {number} percent */
  DISCOUNT: (percent) => `−${percent}%`,
  /** @param {number} percent */
  TOMORROW: (percent) => `Завтра −${percent}%`,
  CLAIM: "Забрать",
  CLAIM_ARIA: "Забрать скидку за возвращение",
  CLAIM_PENDING: "…",
  CLAIMED: "Скидка активна сегодня",
  CLAIMED_SHORT: "Активна",
  USED: "Использована",
  USED_HINT: "Завтра снова день 1",
  HINT: "Продвижение, баннер, каталог, розыгрыш",
  DESCRIPTION:
    "Заходите каждый день, забирайте скидку и тратьте на продвижение, баннер, каталог или розыгрыш.",
  ERROR_FALLBACK: "Не удалось забрать скидку",
};
