type OrderWithId = { _id?: string | null };

export const buildAttentionOrderIdsKey = <T extends OrderWithId>(
  orders: T[],
  needsAttention: (order: T) => boolean,
): string => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return "";
  }

  return orders
    .filter(needsAttention)
    .map((order) => String(order._id ?? ""))
    .filter(Boolean)
    .sort()
    .join(",");
};

export const mergeExpandedIdsFromKey = (prev: Set<string>, idsKey: string): Set<string> => {
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
};
