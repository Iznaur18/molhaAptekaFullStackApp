import { describe, expect, it } from "vitest";

import { createImageRow } from "../lib/productImageRowHelpers.js";
import { moveProductImageRows } from "./moveProductImageRows.js";

describe("moveProductImageRows", () => {
  it("moves row left and right within bounds", () => {
    const rows = [createImageRow("a"), createImageRow("b"), createImageRow("c")];

    expect(moveProductImageRows(rows, rows[1].id, -1)).toEqual({
      rows: [rows[1], rows[0], rows[2]],
      oldIndex: 1,
      newIndex: 0,
    });

    expect(moveProductImageRows(rows, rows[0].id, -1)).toBeNull();
    expect(moveProductImageRows(rows, rows[2].id, 1)).toBeNull();
  });
});
