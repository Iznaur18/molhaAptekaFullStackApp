import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  productHasImages,
  productsWithoutImagesFilter,
} from "../services/product/productImagePresence.js";

const SERVER_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("productHasImages detects array and legacy field", () => {
  assert.equal(productHasImages({ productImageUrls: [] }), false);
  assert.equal(productHasImages({ productImageUrls: ["  "] }), false);
  assert.equal(productHasImages({ productImageUrls: ["/uploads/a.jpg"] }), true);
  assert.equal(productHasImages({ productImageUrl: "/uploads/legacy.jpg" }), true);
});

test("maintenance script exports mongo filter and apply flag", () => {
  const source = readFileSync(
    join(SERVER_ROOT, "scripts/deleteProductsWithoutImages.js"),
    "utf8",
  );

  assert.equal(typeof productsWithoutImagesFilter.$expr, "object");
  assert.match(source, /--apply/);
  assert.match(source, /getProductIdsWithOpenSales/);
  assert.match(source, /deleteProductsCascade/);
});
