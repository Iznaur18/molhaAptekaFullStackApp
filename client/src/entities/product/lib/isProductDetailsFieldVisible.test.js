import assert from "node:assert/strict";
import test from "node:test";

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
  assert.equal(isProductDetailsFieldVisible("productDescription", product), true);
  assert.equal(
    isProductDetailsFieldVisible("productDescription", {
      ...product,
      productDescription: "   ",
    }),
    false,
  );
});

test("meta fields stay visible without detailsHideWhenEmpty", () => {
  assert.equal(isProductDetailsFieldVisible("createdAt", product), true);
});

test("filterProductDetailsVisibleFieldKeys drops empty description block", () => {
  assert.deepEqual(
    filterProductDetailsVisibleFieldKeys(
      ["productDescription", "createdAt"],
      { ...product, productDescription: "" },
    ),
    ["createdAt"],
  );
});
