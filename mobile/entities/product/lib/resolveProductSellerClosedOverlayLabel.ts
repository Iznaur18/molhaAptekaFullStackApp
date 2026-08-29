import { formatSellerClosedUntilLabel } from "@molha/api-contract";

import { PRODUCT_CARD_UI } from "@/shared/config";

export const resolveProductSellerClosedOverlayLabel = (
  product: Record<string, unknown> | null | undefined,
): string => {
  const opensAt = product?.sellerClosedOpensAt;
  if (typeof opensAt === "string" && opensAt.trim() !== "") {
    return formatSellerClosedUntilLabel(opensAt.trim());
  }

  return PRODUCT_CARD_UI.SELLER_CLOSED_OVERLAY_FALLBACK;
};
