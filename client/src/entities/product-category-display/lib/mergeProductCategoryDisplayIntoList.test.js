import { describe, expect, it } from "vitest";

import { mergeProductCategoryDisplayIntoList } from "./mergeProductCategoryDisplayIntoList.js";

describe("mergeProductCategoryDisplayIntoList", () => {
  it("replaces same categoryId", () => {
    const merged = mergeProductCategoryDisplayIntoList(
      [
        {
          categoryId: "abc",
          categorySlug: null,
          customLabel: null,
          imageUrl: "/uploads/old.jpg",
        },
      ],
      {
        categoryId: "abc",
        categorySlug: null,
        customLabel: null,
        imageUrl: "/uploads/new.jpg",
      },
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].imageUrl).toBe("/uploads/new.jpg");
  });

  it("replaces same categorySlug", () => {
    const merged = mergeProductCategoryDisplayIntoList(
      [
        {
          categoryId: null,
          categorySlug: "electronics",
          customLabel: null,
          imageUrl: "/uploads/old.jpg",
        },
      ],
      {
        categoryId: null,
        categorySlug: "electronics",
        customLabel: null,
        imageUrl: "/uploads/new.jpg",
      },
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].imageUrl).toBe("/uploads/new.jpg");
  });

  it("keeps unrelated rows", () => {
    const merged = mergeProductCategoryDisplayIntoList(
      [
        {
          categoryId: null,
          categorySlug: "food",
          customLabel: null,
          imageUrl: "/uploads/food.jpg",
        },
      ],
      {
        categoryId: "abc",
        categorySlug: null,
        customLabel: null,
        imageUrl: "/uploads/electronics.jpg",
      },
    );

    expect(merged).toHaveLength(2);
  });
});
