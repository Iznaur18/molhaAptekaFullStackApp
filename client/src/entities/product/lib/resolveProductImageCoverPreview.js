import {
  isDisplayableProductImageUrl,
  resolveImageUrlForDisplay,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../lib/productImageRowHelpers.js').ProductImageRow[]} rows
 * @param {number} [preferredIndex]
 */
export function resolveProductImageCoverRow(rows, preferredIndex = 0) {
  const preferred = rows[preferredIndex];
  if (preferred && String(preferred.url).trim()) {
    return { row: preferred, index: preferredIndex };
  }

  const firstFilledIndex = rows.findIndex((row) => String(row.url).trim());
  if (firstFilledIndex >= 0) {
    return { row: rows[firstFilledIndex], index: firstFilledIndex };
  }

  return { row: rows[0] ?? null, index: 0 };
}

/**
 * @param {string} url
 */
export function resolveProductImagePreviewMeta(url) {
  const trimmed = String(url ?? "").trim();
  const displayUrl = resolveImageUrlForDisplay(trimmed);
  const canPreview = displayUrl !== "" && isDisplayableProductImageUrl(trimmed);

  return {
    trimmed,
    displayUrl,
    canPreview,
  };
}

/**
 * @param {import('../lib/productImageRowHelpers.js').ProductImageRow[]} rows
 */
export function countFilledProductImageRows(rows) {
  return rows.filter((row) => String(row.url).trim()).length;
}

/**
 * @param {number} removeIndex
 * @param {number} selectedIndex
 * @param {number} nextLength
 */
export function resolveProductImageSelectionAfterRemove(removeIndex, selectedIndex, nextLength) {
  if (nextLength <= 0) {
    return 0;
  }

  if (removeIndex < 0) {
    return Math.min(selectedIndex, nextLength - 1);
  }

  if (selectedIndex > removeIndex) {
    return selectedIndex - 1;
  }

  if (selectedIndex === removeIndex) {
    return Math.min(removeIndex, nextLength - 1);
  }

  return selectedIndex;
}

/** @param {number} oldIndex @param {number} newIndex @param {number} selectedIndex */
export function resolveProductImageSelectionAfterReorder(oldIndex, newIndex, selectedIndex) {
  if (selectedIndex === oldIndex) {
    return newIndex;
  }

  if (oldIndex < selectedIndex && newIndex >= selectedIndex) {
    return selectedIndex - 1;
  }

  if (oldIndex > selectedIndex && newIndex <= selectedIndex) {
    return selectedIndex + 1;
  }

  return selectedIndex;
}

/**
 * @param {import('../lib/productImageRowHelpers.js').ProductImageRow[]} rows
 * @param {number} preferredIndex
 */
export function resolveProductImageCoverPreview(rows, preferredIndex = 0) {
  const { row } = resolveProductImageCoverRow(rows, preferredIndex);
  return resolveProductImagePreviewMeta(row?.url ?? "");
}
