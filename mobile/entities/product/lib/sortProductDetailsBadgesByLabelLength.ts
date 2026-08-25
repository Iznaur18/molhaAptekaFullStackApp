/**
 * Порядок бейджей в шапке товара: сначала короткие подписи, при равной длине —
 * по ключу, чтобы раскладка не «прыгала» между рендерами.
 *
 * Живёт отдельным модулем без alias-импортов: так его можно импортировать
 * напрямую в `node --test` (scripts/product-details-badge-sort.test.mjs).
 */
export const sortProductDetailsBadgesByLabelLength = <
  T extends { key: string; label: string },
>(
  items: readonly T[],
): T[] =>
  [...items].sort((left, right) => {
    const byLength = left.label.length - right.label.length;
    if (byLength !== 0) {
      return byLength;
    }
    return left.key.localeCompare(right.key);
  });
