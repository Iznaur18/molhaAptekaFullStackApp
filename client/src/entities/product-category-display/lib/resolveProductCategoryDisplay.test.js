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

  it("resolves display override saved under legacy slug", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "abc123",
          slug: "electronics-v2",
          labelRu: "Электроника",
          parentId: null,
          depth: 0,
          pathSlugs: ["electronics-v2"],
          pathLabelRu: ["Электроника"],
          isLeaf: false,
          legacyProductCategory: "electronics",
          searchKeywords: [],
        },
      ],
      [
        {
          categorySlug: "electronics",
          categoryId: null,
          customLabel: null,
          imageUrl: "/uploads/electronics.jpg",
        },
      ],
    );

    const electronics = items.find((item) => item.categorySlug === "electronics");
    expect(electronics?.imageUrl).toBe("/uploads/electronics.jpg");
    expect(electronics?.isCustomImage).toBe(true);
  });

  it("exposes displaySlug for patch when root slug differs from legacy", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "abc123",
          slug: "electronics-v2",
          labelRu: "Электроника",
          parentId: null,
          depth: 0,
          pathSlugs: ["electronics-v2"],
          pathLabelRu: ["Электроника"],
          isLeaf: false,
          legacyProductCategory: "electronics",
          searchKeywords: [],
        },
      ],
      [
        {
          categorySlug: "electronics-v2",
          categoryId: null,
          customLabel: null,
          imageUrl: "/uploads/electronics-v2.jpg",
        },
      ],
    );

    const electronics = items.find((item) => item.categorySlug === "electronics");
    expect(electronics?.displaySlug).toBe("electronics-v2");
    expect(electronics?.imageUrl).toBe("/uploads/electronics-v2.jpg");
  });

  it("resolves display override saved under categoryId", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "abc123",
          slug: "appliances",
          labelRu: "Бытовая техника",
          parentId: null,
          depth: 0,
          pathSlugs: ["appliances"],
          pathLabelRu: ["Бытовая техника"],
          isLeaf: false,
          legacyProductCategory: "appliances",
          searchKeywords: [],
        },
      ],
      [
        {
          categorySlug: null,
          categoryId: "abc123",
          customLabel: null,
          imageUrl: "/uploads/appliances.jpg",
        },
      ],
    );

    const appliances = items.find((item) => item.categorySlug === "appliances");
    expect(appliances?.imageUrl).toBe("/uploads/appliances.jpg");
    expect(appliances?.categoryId).toBe("abc123");
  });
});
