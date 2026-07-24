import { getCartLineExclusionReason } from "./getCartLineExclusionReason.js";

/**
 * @param {import("./selectCartLines.js").CartLine[]} lines
 * @param {string | null | undefined} currentUserId
 * @returns {import("./selectCartLines.js").CartLine[]}
 */
export function selectPurchasableCartLines(lines, currentUserId) {
  return lines.filter(
    (line) => getCartLineExclusionReason(line, currentUserId) === null,
  );
}
