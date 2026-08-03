import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveRuRegionCodeFromDadataData } from "../src/ruRegions.js";

describe("resolveRuRegionCodeFromDadataData", () => {
  it("prefers region_iso_code", () => {
    assert.equal(
      resolveRuRegionCodeFromDadataData({ region_iso_code: "RU-MOW" }),
      "RU-MOW",
    );
  });

  it("falls back to region label / city alias", () => {
    assert.equal(
      resolveRuRegionCodeFromDadataData({ region: "Москва" }),
      "RU-MOW",
    );
    assert.equal(
      resolveRuRegionCodeFromDadataData({ city: "Санкт-Петербург" }),
      "RU-SPE",
    );
  });

  it("returns null for unknown", () => {
    assert.equal(resolveRuRegionCodeFromDadataData({}), null);
    assert.equal(resolveRuRegionCodeFromDadataData(null), null);
  });
});
