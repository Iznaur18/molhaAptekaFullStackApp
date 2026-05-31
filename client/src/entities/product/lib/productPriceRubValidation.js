import {
  PRODUCT_PRICE_RUB_MAX,
  PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE,
} from "../model/productConstants.js";

/**
 * @param {number} price
 * @returns {string | null}
 */
export function getProductPriceRubMaxError(price) {
  if (!Number.isFinite(price) || price > PRODUCT_PRICE_RUB_MAX) {
    return PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE;
  }
  return null;
}

export { PRODUCT_PRICE_RUB_MAX };
