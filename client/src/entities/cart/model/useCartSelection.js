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

  /** Выбрать/снять все id секции (остальные секции не трогаем). */
  const toggleAllIn = useCallback((ids) => {
    setDeselectedIds((prev) => {
      const idList = Array.from(ids);
      if (idList.length === 0) {
        return prev;
      }
      const allSelected = idList.every((id) => !prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        for (const id of idList) {
          next.add(id);
        }
      } else {
        for (const id of idList) {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const isLineSelected = useCallback(
    (productId) => !deselectedIds.has(productId),
    [deselectedIds],
  );

  const areAllSelectedIn = useCallback(
    (ids) => {
      const idList = Array.from(ids);
      return idList.length > 0 && idList.every((id) => !deselectedIds.has(id));
    },
    [deselectedIds],
  );

  const selectedCountIn = useCallback(
    (ids) => {
      let count = 0;
      for (const id of ids) {
        if (!deselectedIds.has(id)) {
          count += 1;
        }
      }
      return count;
    },
    [deselectedIds],
  );

  return {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAll,
    toggleAllIn,
    areAllSelectedIn,
    selectedCountIn,
    areAllSelected: deselectedIds.size === 0,
    selectedCount: purchasableIdSet.size - deselectedIds.size,
  };
}
