/**
 * Убирает из набора снятых галочек товары, которых больше нет среди доступных
 * к покупке строк: иначе заново добавленный товар открылся бы невыбранным.
 * Возвращает прежний набор, если убирать нечего.
 *
 * @param {ReadonlySet<string>} deselectedIds
 * @param {ReadonlySet<string>} purchasableIds
 * @returns {ReadonlySet<string>}
 */
export function pruneCartDeselection(deselectedIds, purchasableIds) {
  const kept = [...deselectedIds].filter((productId) =>
    purchasableIds.has(productId),
  );
  return kept.length === deselectedIds.size ? deselectedIds : new Set(kept);
}
