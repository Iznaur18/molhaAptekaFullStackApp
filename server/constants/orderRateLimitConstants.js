/** POST /order — оформление заказа с одного аккаунта. */
export const ORDER_CREATE_RATE_LIMIT_PER_HOUR = 30;

/** PATCH /order/.../items/... — действия продавца/покупателя по позиции. */
export const ORDER_ITEM_ACTION_RATE_LIMIT_PER_15_MIN = 120;
