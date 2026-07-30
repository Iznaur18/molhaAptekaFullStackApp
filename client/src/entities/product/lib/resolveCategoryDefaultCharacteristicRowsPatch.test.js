import { describe, expect, it } from "vitest";

import { resolveCategoryDefaultCharacteristicRowsPatch } from "./resolveCategoryDefaultCharacteristicRowsPatch.js";

describe("resolveCategoryDefaultCharacteristicRowsPatch", () => {
  it("returns null when seller already touched rows", () => {
    expect(
      resolveCategoryDefaultCharacteristicRowsPatch({
        productCategoryId: "cat1",
        categoryDefaultCharacteristicKeys: ["Цвет"],
        productCharacteristicsSellerTouched: true,
        productCharacteristicsAutoAppliedForCategoryId: null,
        productCharacteristicRows: [],
      }),
    ).toBeNull();
  });

  it("applies keys for a leaf category", () => {
    const patch = resolveCategoryDefaultCharacteristicRowsPatch({
      productCategoryId: "cat1",
      categoryDefaultCharacteristicKeys: ["Цвет", "ОЗУ"],
      productCharacteristicsSellerTouched: false,
      productCharacteristicsAutoAppliedForCategoryId: null,
      productCharacteristicRows: [],
    });

    expect(patch).not.toBeNull();
    expect(patch.productCharacteristicsAutoAppliedForCategoryId).toBe("cat1");
    expect(patch.productCharacteristicRows.map((row) => row.key)).toEqual([
      "Цвет",
      "ОЗУ",
    ]);
    expect(patch.productCharacteristicRows.every((row) => row.value === "")).toBe(
      true,
    );
  });

  it("skips when already applied for the same category", () => {
    expect(
      resolveCategoryDefaultCharacteristicRowsPatch({
        productCategoryId: "cat1",
        categoryDefaultCharacteristicKeys: ["Цвет"],
        productCharacteristicsSellerTouched: false,
        productCharacteristicsAutoAppliedForCategoryId: "cat1",
        productCharacteristicRows: [{ id: "1", key: "Цвет", value: "" }],
      }),
    ).toBeNull();
  });

  it("clears rows when category has no template and seller did not touch", () => {
    const patch = resolveCategoryDefaultCharacteristicRowsPatch({
      productCategoryId: "cat2",
      categoryDefaultCharacteristicKeys: [],
      productCharacteristicsSellerTouched: false,
      productCharacteristicsAutoAppliedForCategoryId: "cat1",
      productCharacteristicRows: [{ id: "1", key: "Цвет", value: "" }],
    });

    expect(patch).toEqual({
      productCharacteristicRows: [],
      productCharacteristicsAutoAppliedForCategoryId: "cat2",
      productCharacteristicsSellerTouched: false,
    });
  });
});
