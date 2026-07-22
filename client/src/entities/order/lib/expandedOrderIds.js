/**
 * Стабильный ключ id заказов, требующих внимания (для deps useEffect).
 * @param {unknown[]} orders
 * @param {(order: unknown) => boolean} needsAttention
 * @returns {string}
 */
export function buildAttentionOrderIdsKey(orders, needsAttention) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return "";
  }

  return orders
    .filter(needsAttention)
    .map((order) => String(order?._id ?? ""))
    .filter(Boolean)
    .sort()
    .join(",");
}

/**
 * Добавляет id в Set; возвращает prev, если ничего не изменилось (без лишнего рендера).
 * @param {Set<string>} prev
 * @param {string} idsKey comma-separated
 * @returns {Set<string>}
 */
export function mergeExpandedIdsFromKey(prev, idsKey) {
  if (!idsKey) {
    return prev;
  }

  const ids = idsKey.split(",");
  let changed = false;
  const next = new Set(prev);
  for (const id of ids) {
    if (!next.has(id)) {
      next.add(id);
      changed = true;
    }
  }
  return changed ? next : prev;
}
