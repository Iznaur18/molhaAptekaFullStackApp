import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterCuratedListsForViewerRegion } from "../services/product/curatedProductListHelpers.js";

describe("filterCuratedListsForViewerRegion", () => {
  it("keeps only lists matching viewer region (default empty → MOW)", () => {
    const lists = [
      { regionCode: "RU-MOW" },
      { regionCode: "RU-CE" },
      { regionCode: "" },
    ];

    assert.deepEqual(
      filterCuratedListsForViewerRegion(lists, "RU-MOW").map((list) => list.regionCode),
      ["RU-MOW", ""],
    );
    assert.deepEqual(
      filterCuratedListsForViewerRegion(lists, "RU-CE").map((list) => list.regionCode),
      ["RU-CE"],
    );
  });
});
