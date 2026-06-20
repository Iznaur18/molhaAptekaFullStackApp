import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useMemo } from "react";

import { createImageRow } from "../lib/productImageRowHelpers.js";
import { moveProductImageRows } from "./moveProductImageRows.js";
import { PRODUCT_IMAGE_URLS_MAX } from "../model/productConstants.js";

/**
 * @param {import('../lib/productImageRowHelpers.js').ProductImageRow[]} rows
 * @param {(rows: import('../lib/productImageRowHelpers.js').ProductImageRow[]) => void} onRowsChange
 */
export function useProductImageUrlRows(rows, onRowsChange) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const canAddRow = rows.length < PRODUCT_IMAGE_URLS_MAX;

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return null;
      }

      const oldIndex = rows.findIndex((row) => row.id === active.id);
      const newIndex = rows.findIndex((row) => row.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return null;
      }

      onRowsChange(arrayMove(rows, oldIndex, newIndex));
      return { oldIndex, newIndex };
    },
    [onRowsChange, rows],
  );

  const updateRowUrl = useCallback(
    (id, url) => {
      onRowsChange(rows.map((row) => (row.id === id ? { ...row, url } : row)));
    },
    [onRowsChange, rows],
  );

  const removeRow = useCallback(
    (id) => {
      if (rows.length <= 1) {
        onRowsChange([createImageRow("")]);
        return 0;
      }

      const removeIndex = rows.findIndex((row) => row.id === id);
      onRowsChange(rows.filter((row) => row.id !== id));
      return removeIndex;
    },
    [onRowsChange, rows],
  );

  const addRow = useCallback(() => {
    if (!canAddRow) {
      return -1;
    }

    onRowsChange([...rows, createImageRow("")]);
    return rows.length;
  }, [canAddRow, onRowsChange, rows]);

  const moveRow = useCallback(
    (id, delta) => {
      const result = moveProductImageRows(rows, id, delta);
      if (!result) {
        return null;
      }

      onRowsChange(result.rows);
      return { oldIndex: result.oldIndex, newIndex: result.newIndex };
    },
    [onRowsChange, rows],
  );

  return {
    sensors,
    rowIds,
    canAddRow,
    maxRows: PRODUCT_IMAGE_URLS_MAX,
    handleDragEnd,
    moveRow,
    updateRowUrl,
    removeRow,
    addRow,
  };
}
