import { arrayMove } from "@dnd-kit/sortable";

/**
 * @param {import('../lib/productImageRowHelpers.js').ProductImageRow[]} rows
 * @param {string} id
 * @param {number} delta
 */
export function moveProductImageRows(rows, id, delta) {
  const oldIndex = rows.findIndex((row) => row.id === id);
  const newIndex = oldIndex + delta;
  if (oldIndex < 0 || newIndex < 0 || newIndex >= rows.length) {
    return null;
  }

  return {
    rows: arrayMove(rows, oldIndex, newIndex),
    oldIndex,
    newIndex,
  };
}
