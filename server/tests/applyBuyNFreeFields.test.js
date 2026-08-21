import assert from "node:assert/strict";
import test from "node:test";

import { applyBuyNFreeFields } from "../services/product/applyBuyNFreeFields.js";

test("applyBuyNFreeFields enables with threshold", () => {
  const $set = {};
  const result = applyBuyNFreeFields(
    { productBuyNFreeEnabled: true, productBuyNFreeThreshold: 4 },
    $set,
    { productBuyNFreeEnabled: false, productBuyNFreeThreshold: null },
  );
  assert.equal($set.productBuyNFreeEnabled, true);
  assert.equal($set.productBuyNFreeThreshold, 4);
  assert.equal(result.shouldResetProgress, false);
});

test("applyBuyNFreeFields resets progress on disable", () => {
  const $set = {};
  const result = applyBuyNFreeFields(
    { productBuyNFreeEnabled: false },
    $set,
    { productBuyNFreeEnabled: true, productBuyNFreeThreshold: 3 },
  );
  assert.equal($set.productBuyNFreeEnabled, false);
  assert.equal(result.shouldResetProgress, true);
});

test("applyBuyNFreeFields resets progress on threshold change", () => {
  const $set = {};
  const result = applyBuyNFreeFields(
    { productBuyNFreeThreshold: 5 },
    $set,
    { productBuyNFreeEnabled: true, productBuyNFreeThreshold: 3 },
  );
  assert.equal($set.productBuyNFreeThreshold, 5);
  assert.equal(result.shouldResetProgress, true);
});

test("applyBuyNFreeFields rejects enable without config", () => {
  assert.throws(
    () =>
      applyBuyNFreeFields(
        { productBuyNFreeEnabled: true },
        {},
        { productBuyNFreeEnabled: false, productBuyNFreeThreshold: null },
      ),
    (error) => error?.statusCode === 400,
  );
});
