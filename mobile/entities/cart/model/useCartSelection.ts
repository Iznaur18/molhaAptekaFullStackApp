import { useCallback, useEffect, useMemo, useState } from "react";

import { pruneCartDeselection } from "../lib/pruneCartDeselection";

const EMPTY_DESELECTION: ReadonlySet<string> = new Set();

/**
 * Выбор строк корзины для оформления.
 *
 * Храним снятые галочки, а не выбранные: товар, только что попавший в корзину,
 * должен быть выбран по умолчанию.
 *
 * @param purchasableIds id доступных к покупке строк; ссылка должна быть стабильной.
 */
export const useCartSelection = (purchasableIds: readonly string[]) => {
  const [deselectedIds, setDeselectedIds] = useState<ReadonlySet<string>>(EMPTY_DESELECTION);

  const purchasableIdSet = useMemo(() => new Set(purchasableIds), [purchasableIds]);

  useEffect(() => {
    setDeselectedIds((prev) => pruneCartDeselection(prev, purchasableIdSet));
  }, [purchasableIdSet]);

  const toggleLine = useCallback((productId: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(productId)) {
        next.add(productId);
      }
      return next;
    });
  }, []);

  /** Выбрано всё — снимаем всё, иначе (выбрано частично или ничего) выбираем всё. */
  const toggleAll = useCallback(() => {
    setDeselectedIds((prev) => (prev.size === 0 ? new Set(purchasableIdSet) : EMPTY_DESELECTION));
  }, [purchasableIdSet]);

  /** Выбрать/снять все id секции (остальные секции не трогаем). */
  const toggleAllIn = useCallback((ids: readonly string[]) => {
    setDeselectedIds((prev) => {
      if (ids.length === 0) {
        return prev;
      }
      const allSelected = ids.every((id) => !prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        for (const id of ids) {
          next.add(id);
        }
      } else {
        for (const id of ids) {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const isLineSelected = useCallback(
    (productId: string) => !deselectedIds.has(productId),
    [deselectedIds],
  );

  const areAllSelectedIn = useCallback(
    (ids: readonly string[]) =>
      ids.length > 0 && ids.every((id) => !deselectedIds.has(id)),
    [deselectedIds],
  );

  const selectedCountIn = useCallback(
    (ids: readonly string[]) => {
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
};
