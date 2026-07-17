/**
 * Убирает из набора снятых галочек товары, которых больше нет среди доступных
 * к покупке строк: иначе заново добавленный товар открылся бы невыбранным.
 * Возвращает прежний набор, если убирать нечего.
 */
export const pruneCartDeselection = (
  deselectedIds: ReadonlySet<string>,
  purchasableIds: ReadonlySet<string>,
): ReadonlySet<string> => {
  const kept = [...deselectedIds].filter((productId) => purchasableIds.has(productId));
  return kept.length === deselectedIds.size ? deselectedIds : new Set(kept);
};
