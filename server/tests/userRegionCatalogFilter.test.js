import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import {
  buildEntityRegionMatch,
  buildProductRegionMatch,
  resolveViewerRegionCodeForRequest,
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
});
