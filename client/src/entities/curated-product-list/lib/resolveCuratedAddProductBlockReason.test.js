import { describe, expect, it } from "vitest";
import { formatCuratedProductRegionMismatchMessage } from "@molha/api-contract";

import { isCuratedProductIdInput } from "./isCuratedProductIdInput.js";
import { resolveCuratedAddProductBlockReason } from "./resolveCuratedAddProductBlockReason.js";

describe("isCuratedProductIdInput", () => {
  it("accepts 24-hex ObjectId", () => {
    expect(isCuratedProductIdInput("507f1f77bcf86cd799439011")).toBe(true);
  });

  it("rejects short or empty", () => {
    expect(isCuratedProductIdInput("")).toBe(false);
    expect(isCuratedProductIdInput("abc")).toBe(false);
  });
});

describe("resolveCuratedAddProductBlockReason", () => {
  it("returns null when region matches and visible", () => {
    expect(
      resolveCuratedAddProductBlockReason({
        preview: {
          productRegionCode: "RU-MOW",
          catalogVisible: true,
        },
        listRegionCode: "RU-MOW",
      }),
    ).toBeNull();
  });

  it("returns catalog when not visible", () => {
    expect(
      resolveCuratedAddProductBlockReason({
        preview: {
          productRegionCode: "RU-MOW",
          catalogVisible: false,
        },
        listRegionCode: "RU-MOW",
      }),
    ).toBe("catalog");
  });

  it("returns mismatch message when regions differ", () => {
    expect(
      resolveCuratedAddProductBlockReason({
        preview: {
          productRegionCode: "RU-CE",
          catalogVisible: true,
        },
        listRegionCode: "RU-MOW",
      }),
    ).toBe(formatCuratedProductRegionMismatchMessage("RU-CE", "RU-MOW"));
  });
});
