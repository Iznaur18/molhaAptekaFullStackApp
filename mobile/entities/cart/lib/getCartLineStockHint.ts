import { CART_LOW_STOCK_WARNING_THRESHOLD } from "@/shared/config/cartConstants";
import { CART_PAGE_UI } from "@/shared/config";

export const getCartLineStockHint = (
  purchaseLimit: number,
  quantity: number,
): string | null => {
  if (purchaseLimit <= 0) {
    return null;
  }

  if (quantity >= purchaseLimit) {
    return CART_PAGE_UI.STOCK_QUANTITY_LIMITED;
  }

  if (purchaseLimit <= CART_LOW_STOCK_WARNING_THRESHOLD) {
    return CART_PAGE_UI.STOCK_REMAINING(purchaseLimit);
  }

  return null;
};
