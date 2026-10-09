import {
  isProductPurchaseBlockedBySeller,
  USER_BLOCKED_PURCHASE_MESSAGE,
} from "@molha/api-contract";

import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {Record<string, unknown> | null | undefined} product
 * @returns {{ isPurchaseBlocked: boolean; blockedLabel: string }}
 */
export function resolveProductPurchaseBlockState(product) {
  if (isProductPurchaseBlockedBySeller(product)) {
    return { isPurchaseBlocked: true, blockedLabel: USER_BLOCKED_PURCHASE_MESSAGE };
  }
  // Товар снят с витрины (поштучно или паузой магазина), но открыт по прямой
  // ссылке: заказ сервер всё равно не примет — говорим об этом сразу.
  if (product?.productIsAvailable === false) {
    return {
      isPurchaseBlocked: true,
      blockedLabel: ADD_TO_CART_UI.TEMPORARILY_UNAVAILABLE,
    };
  }
  return { isPurchaseBlocked: false, blockedLabel: USER_BLOCKED_PURCHASE_MESSAGE };
}
