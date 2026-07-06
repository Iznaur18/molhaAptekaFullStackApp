export const mergeExpandedRowIds = (
  prev: ReadonlySet<string>,
  idsToAdd: Iterable<string>,
): Set<string> => {
  const next = new Set(prev);
  let changed = false;

  for (const id of idsToAdd) {
    if (!next.has(id)) {
      next.add(id);
      changed = true;
    }
  }

  return changed ? next : prev;
};
