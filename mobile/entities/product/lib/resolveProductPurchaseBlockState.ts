import { isProductPurchaseBlockedBySeller, USER_BLOCKED_PURCHASE_MESSAGE } from "@molha/api-contract";

export function resolveProductPurchaseBlockState(product: Record<string, unknown> | null | undefined) {
  const isPurchaseBlocked = isProductPurchaseBlockedBySeller(product);
  return {
    isPurchaseBlocked,
    blockedLabel: USER_BLOCKED_PURCHASE_MESSAGE,
  };
}
