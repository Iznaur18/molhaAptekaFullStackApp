import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_VIEWER_REGION_CODE,
  getRuRegionByCode,
  isRuRegionCode,
  listRuRegions,
  resolveRuRegionCodeFromLabel,
  resolveViewerRegionCode,
  requiredRuRegionCodeFieldSchema,
  RU_REGIONS,
} from "../src/ruRegions.js";

describe("ruRegions", () => {
  it("держит уникальные code и name", () => {
    const codes = new Set();
    const names = new Set();
    for (const region of RU_REGIONS) {
      assert.equal(codes.has(region.code), false, region.code);
      assert.equal(names.has(region.name), false, region.name);
      codes.add(region.code);
      names.add(region.name);
    }
    assert.equal(RU_REGIONS.length, 91);
  });

  it("дефолт зрителя — Москва", () => {
    assert.equal(DEFAULT_VIEWER_REGION_CODE, "RU-MOW");
    assert.equal(getRuRegionByCode("RU-MOW")?.name, "Город федерального значения Москва");
    assert.equal(resolveViewerRegionCode(null), "RU-MOW");
    assert.equal(resolveViewerRegionCode(""), "RU-MOW");
    assert.equal(resolveViewerRegionCode("RU-CE"), "RU-CE");
  });

  it("резолвит aliases", () => {
    assert.equal(resolveRuRegionCodeFromLabel("Чечня"), "RU-CE");
    assert.equal(resolveRuRegionCodeFromLabel("Москва"), "RU-MOW");
    assert.equal(resolveRuRegionCodeFromLabel("СПб"), "RU-SPE");
    assert.equal(resolveRuRegionCodeFromLabel("неизвестно"), null);
  });

  it("listRuRegions / isRuRegionCode", () => {
    assert.equal(listRuRegions().length, 91);
    assert.equal(isRuRegionCode("RU-TA"), true);
    assert.equal(isRuRegionCode("XX"), false);
  });

  it("zod required region", () => {
    assert.equal(requiredRuRegionCodeFieldSchema.parse("RU-KDA"), "RU-KDA");
    assert.throws(() => requiredRuRegionCodeFieldSchema.parse(""));
    assert.throws(() => requiredRuRegionCodeFieldSchema.parse("Москва"));
  });
});
