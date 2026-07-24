import { useCallback, useEffect, useMemo, useState } from "react";

import { pruneCartDeselection } from "../lib/pruneCartDeselection.js";

/** @type {ReadonlySet<string>} */
const EMPTY_DESELECTION = new Set();

/**
 * Выбор строк корзины для оформления.
 * Храним снятые галочки: новый товар в корзине выбран по умолчанию.
 *
 * @param {readonly string[]} purchasableIds
 */
export function useCartSelection(purchasableIds) {
  const [deselectedIds, setDeselectedIds] = useState(EMPTY_DESELECTION);

  const purchasableIdSet = useMemo(
    () => new Set(purchasableIds),
    [purchasableIds],
  );

  useEffect(() => {
    setDeselectedIds((prev) => pruneCartDeselection(prev, purchasableIdSet));
  }, [purchasableIdSet]);

  const toggleLine = useCallback((productId) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(productId)) {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setDeselectedIds((prev) =>
      prev.size === 0 ? new Set(purchasableIdSet) : EMPTY_DESELECTION,
    );
  }, [purchasableIdSet]);

  const isLineSelected = useCallback(
    (productId) => !deselectedIds.has(productId),
    [deselectedIds],
  );

  return {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAll,
    areAllSelected: deselectedIds.size === 0,
    selectedCount: purchasableIdSet.size - deselectedIds.size,
  };
}
