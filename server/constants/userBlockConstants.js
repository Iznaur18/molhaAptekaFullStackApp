/** Синхрон с `contract/src/userBlock.js`. */
export const USER_BLOCK_MAX_PER_USER = 500;

export const USER_BLOCK_LIST_MAX_LIMIT = 50;

export const USER_BLOCK_CANNOT_BLOCK_SELF_MESSAGE = "Нельзя заблокировать себя";

export const USER_BLOCK_TARGET_NOT_FOUND_MESSAGE = "Пользователь не найден";

export const USER_BLOCK_LIMIT_REACHED_MESSAGE = `Достигнут лимит блокировок (${USER_BLOCK_MAX_PER_USER})`;

export const USER_BLOCK_NOT_BLOCKED_MESSAGE = "Пользователь не заблокирован";

export const USER_BLOCKED_PURCHASE_MESSAGE = "Вы заблокированы";

export const USER_BLOCK_CART_ORDER_MESSAGE = USER_BLOCKED_PURCHASE_MESSAGE;

export const IN_APP_NOTIFICATION_KIND_USER_BLOCKED = "user_blocked_by_seller";

/**
 * @param {string} blockerName
 */
export const buildUserBlockedNotificationMessage = (blockerName) => {
  const name = blockerName?.trim() || "Пользователь";
  return `${name} ограничил для вас покупки`;
};
