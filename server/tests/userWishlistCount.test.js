import assert from "node:assert/strict";
import test from "node:test";

import { countWishlistItems } from "../services/user/userWishlistCount.js";

test("число желаний — количество товаров в списке", () => {
  assert.equal(
    countWishlistItems({
      aaaaaaaaaaaaaaaaaaaaaaaa: 1700000000000,
      bbbbbbbbbbbbbbbbbbbbbbbb: 1700000001000,
    }),
    2,
  );
});

test("пустой или битый список желаний — ноль", () => {
  assert.equal(countWishlistItems(undefined), 0);
  assert.equal(countWishlistItems(null), 0);
  assert.equal(countWishlistItems([]), 0);
  assert.equal(countWishlistItems({}), 0);
});

test("мусорные ключи в списке желаний не считаются", () => {
  assert.equal(
    countWishlistItems({ aaaaaaaaaaaaaaaaaaaaaaaa: 1700000000000, "not-an-id": 1 }),
    1,
  );
});
