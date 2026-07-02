import { expect, test } from "vitest";

import {
  filterProductDetailsVisibleFieldKeys,
  isProductDetailsFieldVisible,
} from "./isProductDetailsFieldVisible.js";

const product = {
  _id: "p1",
  productDescription: "Новый компьютер",
  productImageUrls: [],
  createdAt: "2026-05-19T19:38:00.000Z",
  updatedAt: "2026-05-19T19:38:00.000Z",
};

test("productDescription hidden when empty", () => {
  expect(isProductDetailsFieldVisible("productDescription", product)).toBe(true);
  expect(
    isProductDetailsFieldVisible("productDescription", {
      ...product,
      productDescription: "   ",
    }),
  ).toBe(false);
});

test("meta fields stay visible without detailsHideWhenEmpty", () => {
  expect(isProductDetailsFieldVisible("createdAt", product)).toBe(true);
});

test("filterProductDetailsVisibleFieldKeys drops empty description block", () => {
  expect(
    filterProductDetailsVisibleFieldKeys(
      ["productDescription", "createdAt"],
      { ...product, productDescription: "" },
    ),
  ).toEqual(["createdAt"]);
});
