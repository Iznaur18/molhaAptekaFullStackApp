import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import {
  buildCatalogRegionPriorityCodes,
  buildCatalogRegionSortPriorityStage,
  buildEntityRegionMatch,
  buildProductRegionMatch,
  CATALOG_REGION_SORT_EMPTY,
  CATALOG_REGION_SORT_OTHER,
  resolveViewerRegionCodeForRequest,
  withCatalogRegionPrioritySort,
} from "../services/user/userRegionCatalogFilter.js";

describe("userRegionCatalogFilter", () => {
  it("buildProductRegionMatch всегда жёстко по code", () => {
    assert.deepEqual(buildProductRegionMatch("RU-CE"), {
      productRegionCode: "RU-CE",
    });
    assert.deepEqual(buildProductRegionMatch(""), {
      productRegionCode: DEFAULT_VIEWER_REGION_CODE,
    });
  });

  it("buildEntityRegionMatch", () => {
    assert.deepEqual(buildEntityRegionMatch("RU-TA"), { regionCode: "RU-TA" });
  });

  it("resolveViewerRegionCodeForRequest: query побеждает", async () => {
    const code = await resolveViewerRegionCodeForRequest({
      userId: null,
      queryRegionCode: "RU-SPE",
    });
    assert.equal(code, "RU-SPE");
  });

  it("resolveViewerRegionCodeForRequest: без всего → Москва", async () => {
    const code = await resolveViewerRegionCodeForRequest({});
    assert.equal(code, DEFAULT_VIEWER_REGION_CODE);
  });

  it("buildCatalogRegionPriorityCodes: viewer first, then MOW/SPE/KDA", () => {
    assert.deepEqual(buildCatalogRegionPriorityCodes("RU-MOW"), [
      "RU-MOW",
      "RU-SPE",
      "RU-KDA",
    ]);
    assert.deepEqual(buildCatalogRegionPriorityCodes("RU-KDA"), [
      "RU-KDA",
      "RU-MOW",
      "RU-SPE",
    ]);
    assert.deepEqual(buildCatalogRegionPriorityCodes("RU-CE"), [
      "RU-CE",
      "RU-MOW",
      "RU-SPE",
      "RU-KDA",
    ]);
  });

  it("buildCatalogRegionSortPriorityStage: empty → end, other → mid", () => {
    const stage = buildCatalogRegionSortPriorityStage("RU-MOW");
    const branches = stage.$addFields._regionSortPriority.$switch.branches;
    assert.equal(branches[0].then, 0);
    assert.equal(branches[0].case.$eq[1], "RU-MOW");
    assert.equal(branches[branches.length - 1].then, CATALOG_REGION_SORT_EMPTY);
    assert.equal(
      stage.$addFields._regionSortPriority.$switch.default,
      CATALOG_REGION_SORT_OTHER,
    );
  });

  it("withCatalogRegionPrioritySort prepends key to $sort", () => {
    const stages = withCatalogRegionPrioritySort(
      { $sort: { createdAt: -1 } },
      "RU-SPE",
    );
    assert.equal(stages.length, 2);
    assert.ok(stages[0].$addFields._regionSortPriority);
    assert.deepEqual(stages[1].$sort, {
      _regionSortPriority: 1,
      createdAt: -1,
    });
  });
});
