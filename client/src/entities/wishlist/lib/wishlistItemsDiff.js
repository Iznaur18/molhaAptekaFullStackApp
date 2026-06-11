/**
 * @param {Record<string, number>} before
 * @param {Record<string, number>} after
 * @returns {{ added: string[]; removed: string[] }}
 */
export function diffWishlistItemIds(before, after) {
  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));

  return {
    added: [...afterKeys].filter((id) => !beforeKeys.has(id)),
    removed: [...beforeKeys].filter((id) => !afterKeys.has(id)),
  };
}
