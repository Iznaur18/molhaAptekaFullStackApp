import { isProductSellerClosedNow, formatSellerClosedUntilLabel } from "@molha/api-contract";
import { ADD_TO_CART_UI } from "@/shared/config";

export const resolveProductSellerClosedPurchaseState = (
  product: Record<string, unknown> | null | undefined,
) => {
  const isSellerClosed = isProductSellerClosedNow(product);
  const opensAt =
    typeof product?.sellerClosedOpensAt === "string" ? product.sellerClosedOpensAt.trim() : "";
  const closedLabel =
    opensAt.length > 0 ? formatSellerClosedUntilLabel(opensAt) : ADD_TO_CART_UI.SELLER_CLOSED;

  return {
    isSellerClosed,
    closedLabel,
  };
};
