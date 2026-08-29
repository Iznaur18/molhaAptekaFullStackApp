import { isProductPurchaseBlockedBySeller, USER_BLOCKED_PURCHASE_MESSAGE } from "@molha/api-contract";

/**
 * @param {Record<string, unknown> | null | undefined} product
 * @returns {{ isPurchaseBlocked: boolean; blockedLabel: string }}
 */
export function resolveProductPurchaseBlockState(product) {
  const isPurchaseBlocked = isProductPurchaseBlockedBySeller(product);
  return {
    isPurchaseBlocked,
    blockedLabel: USER_BLOCKED_PURCHASE_MESSAGE,
  };
}
