import { describe, expect, it } from "vitest";

import { PRODUCT_CATEGORIES } from "../../product/model/productConstants.js";
import { buildResolvedProductCategoryDisplaysFromRoots } from "./resolveProductCategoryDisplay.js";

describe("buildResolvedProductCategoryDisplaysFromRoots", () => {
  it("always keeps legacy PRODUCT_CATEGORIES slots", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots([], []);

    expect(items).toHaveLength(PRODUCT_CATEGORIES.length);
    expect(items[0].categorySlug).toBe(PRODUCT_CATEGORIES[0]);
    expect(items[0].categoryId).toBeNull();
  });

  it("appends new db roots after legacy list", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "64f1",
          slug: "custom-pets",
          labelRu: "Питомцы+",
          parentId: null,
          depth: 0,
          pathSlugs: ["custom-pets"],
          pathLabelRu: ["Питомцы+"],
          isLeaf: false,
          legacyProductCategory: null,
          searchKeywords: [],
        },
      ],
      [],
    );

    expect(items).toHaveLength(PRODUCT_CATEGORIES.length + 1);
    expect(items.at(-1)).toMatchObject({
      categoryId: "64f1",
      categorySlug: "custom-pets",
      label: "Питомцы+",
    });
  });

  it("binds legacy slug to matching db root id", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "abc123",
          slug: "electronics",
          labelRu: "Электроника",
          parentId: null,
          depth: 0,
          pathSlugs: ["electronics"],
          pathLabelRu: ["Электроника"],
          isLeaf: false,
          legacyProductCategory: "electronics",
          searchKeywords: [],
        },
      ],
      [],
    );

    const electronics = items.find((item) => item.categorySlug === "electronics");
    expect(electronics?.categoryId).toBe("abc123");
    expect(items).toHaveLength(PRODUCT_CATEGORIES.length);
  });
});
