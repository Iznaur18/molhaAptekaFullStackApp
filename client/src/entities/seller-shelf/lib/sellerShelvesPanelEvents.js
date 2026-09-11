export const SELLER_SHELVES_EXPAND_EVENT = "gitorg:expand-seller-shelves";

export function requestSellerShelvesPanelExpand() {
  window.dispatchEvent(new CustomEvent(SELLER_SHELVES_EXPAND_EVENT));
}
