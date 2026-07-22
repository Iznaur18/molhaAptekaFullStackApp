import { describe, expect, it } from "vitest";

import { sortProductDetailsBadgesByLabelLength } from "./buildProductDetailsBadgeItems.js";

describe("sortProductDetailsBadgesByLabelLength", () => {
  it("orders shortest labels first", () => {
    const sorted = sortProductDetailsBadgesByLabelLength([
      { key: "long", label: "Очень длинный бейдж" },
      { key: "short", label: "Топ" },
      { key: "mid", label: "Аукцион" },
    ]);

    expect(sorted.map((item) => item.key)).toEqual(["short", "mid", "long"]);
  });
});
