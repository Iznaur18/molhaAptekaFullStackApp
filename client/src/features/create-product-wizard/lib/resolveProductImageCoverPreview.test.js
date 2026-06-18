import { describe, expect, it } from "vitest";

import { createImageRow } from "../../../entities/product/lib/productImageRowHelpers.js";
import {
  countFilledProductImageRows,
  resolveProductImageCoverRow,
  resolveProductImageSelectionAfterRemove,
  resolveProductImageSelectionAfterReorder,
} from "../../../entities/product/lib/resolveProductImageCoverPreview.js";

describe("resolveProductImageCoverPreview helpers", () => {
  it("prefers selected index when it has url", () => {
    const rows = [createImageRow(""), createImageRow("https://example.com/2.jpg")];
    expect(resolveProductImageCoverRow(rows, 1).index).toBe(1);
  });

  it("falls back to first filled image", () => {
    const rows = [createImageRow(""), createImageRow("https://example.com/2.jpg")];
    expect(resolveProductImageCoverRow(rows, 0).index).toBe(1);
  });

  it("counts filled rows", () => {
    const rows = [createImageRow("a"), createImageRow(""), createImageRow("b")];
    expect(countFilledProductImageRows(rows)).toBe(2);
  });

  it("updates selection after reorder", () => {
    expect(resolveProductImageSelectionAfterReorder(0, 2, 0)).toBe(2);
    expect(resolveProductImageSelectionAfterReorder(2, 0, 1)).toBe(2);
  });

  it("updates selection after remove", () => {
    expect(resolveProductImageSelectionAfterRemove(1, 2, 2)).toBe(1);
    expect(resolveProductImageSelectionAfterRemove(0, 0, 1)).toBe(0);
  });
});
