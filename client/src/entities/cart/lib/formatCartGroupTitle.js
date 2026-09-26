import { PRODUCT_DELIVERY_CARRIER_LABEL_RU } from "@molha/api-contract";

import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Служба группы, если продавец разделён по службам доставки; иначе "".
 *
 * @param {{ splitCarrier?: string | null }} group
 * @returns {string}
 */
export function formatCartGroupCarrierLabel(group) {
  const carrier = group?.splitCarrier;
  if (!carrier) {
    return "";
  }
  return (
    PRODUCT_DELIVERY_CARRIER_LABEL_RU[carrier] ?? CART_PAGE_UI.SPLIT_CARRIER_PICKUP_ONLY
  );
}

/**
 * Заголовок группы корзины: имя продавца и, у разделённого, служба.
 *
 * @param {{ sellerName?: string; splitCarrier?: string | null }} group
 * @returns {string}
 */
export function formatCartGroupTitle(group) {
  const name = group?.sellerName?.trim() || CART_PAGE_UI.SECTION_SELLER_FALLBACK;
  const carrier = formatCartGroupCarrierLabel(group);
  return carrier ? `${name} · ${carrier}` : name;
}
