import { getCartLineExclusionReason } from "./getCartLineExclusionReason";
import type { CartLine } from "./selectCartLines";

export const selectPurchasableCartLines = (
  lines: CartLine[],
  currentUserId?: string | null,
): CartLine[] =>
  lines.filter((line) => getCartLineExclusionReason(line, currentUserId) === null);
