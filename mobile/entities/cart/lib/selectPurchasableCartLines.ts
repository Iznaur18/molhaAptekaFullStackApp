import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";

import type { CartLine } from "./selectCartLines";

export const selectPurchasableCartLines = (
  lines: CartLine[],
  currentUserId?: string | null,
): CartLine[] =>
  lines.filter(
    (line) =>
      !line.isMissing &&
      line.product?.productIsAvailable !== false &&
      !isCurrentUserProductSeller(line.product, currentUserId),
  );
