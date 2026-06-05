export const USER_FOLLOW_MAX_LIST_LIMIT = 50;

export const USER_FOLLOW_CANNOT_FOLLOW_SELF_MESSAGE = "Нельзя подписаться на себя";

export const USER_FOLLOW_TARGET_BLOCKED_MESSAGE =
  "Нельзя подписаться на заблокированного пользователя";

export const USER_FOLLOW_TARGET_NOT_FOUND_MESSAGE = "Пользователь не найден";

export const USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE =
  "Фильтр «только подписки» доступен после входа";

export const IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER = "user_new_follower";

export const IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT =
  "followed_seller_new_product";

export const IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_RAFFLE_COMPLETED =
  "followed_seller_raffle_completed";

/**
 * @param {string} followerName
 */
export const buildNewFollowerNotificationMessage = (followerName) => {
  const name = followerName?.trim() || "Пользователь";
  return `${name} подписался на вас`;
};

/**
 * @param {string} sellerName
 * @param {string} productName
 */
export const buildFollowedSellerNewProductMessage = (sellerName, productName) => {
  const seller = sellerName?.trim() || "Продавец";
  const product = productName?.trim() || "товар";
  return `${seller} опубликовал новый товар «${product}»`;
};

/**
 * @param {string} sellerName
 * @param {string} raffleTitle
 */
export const buildFollowedSellerRaffleCompletedMessage = (sellerName, raffleTitle) => {
  const seller = sellerName?.trim() || "Продавец";
  const title = raffleTitle?.trim() || "розыгрыш";
  return `${seller} завершил розыгрыш «${title}»`;
};
