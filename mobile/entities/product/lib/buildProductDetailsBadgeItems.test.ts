import { sortProductDetailsBadgesByLabelLength } from "./buildProductDetailsBadgeItems";

describe("sortProductDetailsBadgesByLabelLength", () => {
  it("orders shortest labels first", () => {
    const sorted = sortProductDetailsBadgesByLabelLength([
      { key: "long", label: "Очень длинный бейдж" },
      { key: "short", label: "Топ" },
      { key: "mid", label: "Аукцион" },
    ]);

    expect(sorted.map((item) => item.key)).toEqual(["short", "mid", "long"]);
  });

  it("uses key as stable tie-breaker", () => {
    const sorted = sortProductDetailsBadgesByLabelLength([
      { key: "b", label: "Топ" },
      { key: "a", label: "Топ" },
    ]);

    expect(sorted.map((item) => item.key)).toEqual(["a", "b"]);
  });
});
