import assert from "node:assert/strict";
import test from "node:test";

import { AppError } from "../errors/AppError.js";
import { applyWholesaleFields } from "../services/product/applyWholesaleFields.js";

test("applyWholesaleFields rejects enable without config", () => {
  const $set = {};
  assert.throws(
    () =>
      applyWholesaleFields(
        { productWholesaleEnabled: true },
        $set,
        { productPrice: 1000, productWholesaleEnabled: false },
      ),
    (error) => error instanceof AppError && error.statusCode === 400,
  );
});

test("applyWholesaleFields saves config while disabled", () => {
  const $set = {};
  applyWholesaleFields(
    { productWholesaleMinQty: 5, productWholesalePrice: 800 },
    $set,
    { productPrice: 1000, productWholesaleEnabled: false },
  );
  assert.equal($set.productWholesaleMinQty, 5);
  assert.equal($set.productWholesalePrice, 800);
});

test("applyWholesaleFields enables when config already set", () => {
  const $set = {};
  applyWholesaleFields(
    { productWholesaleEnabled: true },
    $set,
    {
      productPrice: 1000,
      productWholesaleEnabled: false,
      productWholesaleMinQty: 5,
      productWholesalePrice: 800,
    },
  );
  assert.equal($set.productWholesaleEnabled, true);
});

test("applyWholesaleFields rejects wholesale >= retail", () => {
  const $set = {};
  assert.throws(
    () =>
      applyWholesaleFields(
        { productWholesaleMinQty: 5, productWholesalePrice: 1000 },
        $set,
        { productPrice: 1000 },
      ),
    (error) => error instanceof AppError && error.statusCode === 400,
  );
});
