import { describe, expect, it } from "vitest";

import { filterSellerStoreTilesBySearch } from "./filterSellerStoreTilesBySearch.js";

describe("filterSellerStoreTilesBySearch", () => {
  const tiles = [
    { _id: "1", sellerId: "a", labelRu: "Аптека Добрый доктор" },
    { _id: "2", sellerId: "b", labelRu: "e2eSellerNew" },
  ];

  it("returns all tiles when search is empty", () => {
    expect(filterSellerStoreTilesBySearch(tiles, "")).toHaveLength(2);
    expect(filterSellerStoreTilesBySearch(tiles, "   ")).toHaveLength(2);
  });

  it("filters by labelRu case-insensitively", () => {
    expect(filterSellerStoreTilesBySearch(tiles, "e2e")).toEqual([tiles[1]]);
    expect(filterSellerStoreTilesBySearch(tiles, "добрый")).toEqual([tiles[0]]);
  });
});
