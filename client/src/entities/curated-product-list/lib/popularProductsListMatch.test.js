import { describe, expect, it } from "vitest";

import {
  curatedListContainsProductId,
  filterPopularProductsLists,
  isPopularProductsListTitle,
  POPULAR_PRODUCTS_LIST_TITLE,
  sortCuratedListsForProductRegion,
} from "./popularProductsListMatch.js";

describe("popularProductsListMatch", () => {
  it("матчит канонический title без регистра", () => {
    expect(isPopularProductsListTitle(POPULAR_PRODUCTS_LIST_TITLE)).toBe(true);
    expect(isPopularProductsListTitle("  популярные товары ")).toBe(true);
    expect(isPopularProductsListTitle("Новинки")).toBe(false);
  });

  it("фильтрует только популярные списки", () => {
    const lists = filterPopularProductsLists([
      { _id: "1", title: "Популярные товары", regionCode: "20" },
      { _id: "2", title: "Новинки", regionCode: "20" },
    ]);
    expect(lists).toHaveLength(1);
    expect(lists[0]._id).toBe("1");
  });

  it("проверяет membership по productId", () => {
    expect(
      curatedListContainsProductId(
        { productIds: ["abc", "6a5bf6539cfea35f316dd4fc"] },
        "6a5bf6539cfea35f316dd4fc",
      ),
    ).toBe(true);
    expect(curatedListContainsProductId({ productIds: ["abc"] }, "zzz")).toBe(
      false,
    );
  });

  it("поднимает списки региона товара вверх", () => {
    const sorted = sortCuratedListsForProductRegion(
      [
        { _id: "1", regionCode: "20", sortOrder: 0 },
        { _id: "2", regionCode: "77", sortOrder: 1 },
      ],
      "77",
    );
    expect(sorted.map((item) => item._id)).toEqual(["2", "1"]);
  });
});
