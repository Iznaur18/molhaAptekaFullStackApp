import { describe, expect, it } from "vitest";

import { buildResolvedProductCategoryDisplaysFromRoots } from "./resolveProductCategoryDisplay.js";

describe("buildResolvedProductCategoryDisplaysFromRoots", () => {
  it("returns empty list when there are no db roots", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots([], []);

    expect(items).toEqual([]);
  });

  it("builds tiles only from db roots", () => {
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

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      categoryId: "64f1",
      categorySlug: "custom-pets",
      displaySlug: "custom-pets",
      label: "Питомцы+",
    });
  });

  it("uses legacyProductCategory as categorySlug when present", () => {
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
      [],
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      categoryId: "abc123",
      categorySlug: "electronics",
      displaySlug: "electronics-v2",
      label: "Электроника",
    });
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

  it("does not invent tiles for legacy slugs missing from roots", () => {
    const items = buildResolvedProductCategoryDisplaysFromRoots(
      [
        {
          id: "only-one",
          slug: "grocery",
          labelRu: "Продукты",
          parentId: null,
          depth: 0,
          pathSlugs: ["grocery"],
          pathLabelRu: ["Продукты"],
          isLeaf: false,
          legacyProductCategory: "grocery",
          searchKeywords: [],
        },
      ],
      [],
    );

    expect(items.map((item) => item.categorySlug)).toEqual(["grocery"]);
  });
});
