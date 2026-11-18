import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterSellerStoreTilesBySearch } from "../dist/index.js";

const tiles = [
  { _id: "1", sellerId: "a", labelRu: "Аптека Добрый доктор" },
  { _id: "2", sellerId: "b", labelRu: "e2eSellerNew" },
];

describe("filterSellerStoreTilesBySearch", () => {
  it("returns all tiles when search is empty", () => {
    assert.equal(filterSellerStoreTilesBySearch(tiles, "").length, 2);
    assert.equal(filterSellerStoreTilesBySearch(tiles, "   ").length, 2);
  });

  it("filters by labelRu case-insensitively", () => {
    assert.deepEqual(filterSellerStoreTilesBySearch(tiles, "e2e"), [tiles[1]]);
    assert.deepEqual(filterSellerStoreTilesBySearch(tiles, "добрый"), [tiles[0]]);
  });

  it("treats ё and е as the same letter", () => {
    const named = [{ labelRu: "Ёлка" }];
    assert.deepEqual(filterSellerStoreTilesBySearch(named, "елка"), named);
  });
});
