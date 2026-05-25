const storageKey = (productId, offerId) =>
  `molha:price-offer-pay-open:${productId}:${offerId}`;

/**
 * @param {string} productId
 * @param {string} offerId
 */
export function markPriceOfferPayFlowOpened(productId, offerId) {
  try {
    sessionStorage.setItem(storageKey(productId, offerId), "1");
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {string} productId
 * @param {string} offerId
 */
export function clearPriceOfferPayFlowOpened(productId, offerId) {
  try {
    sessionStorage.removeItem(storageKey(productId, offerId));
  } catch {
    // ignore
  }
}

/**
 * @param {string} productId
 * @param {string} offerId
 */
export function isPriceOfferPayFlowOpened(productId, offerId) {
  try {
    return sessionStorage.getItem(storageKey(productId, offerId)) === "1";
  } catch {
    return false;
  }
}
