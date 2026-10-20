import { PRODUCT_PRICE_OFFER_UI } from "../../../shared/config/appUiCopy.js";

/** Статус ставки словами для продавца (в архиве раньше был сырой `rejected`). */
const PRICE_OFFER_STATUS_LABELS = {
  pending: PRODUCT_PRICE_OFFER_UI.STATUS_PENDING,
  accepted: PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE,
  ordered: PRODUCT_PRICE_OFFER_UI.STATUS_ORDERED,
  rejected: PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED,
};

/**
 * @param {string | undefined | null} status
 * @returns {string}
 */
export function resolvePriceOfferStatusLabel(status) {
  if (!status) return "";
  return PRICE_OFFER_STATUS_LABELS[status] ?? status;
}
