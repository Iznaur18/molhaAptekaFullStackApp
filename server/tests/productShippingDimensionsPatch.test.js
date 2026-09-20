import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Патч товара собирается полем за полем: новое поле, забытое в этом сборщике,
 * молча не сохраняется. Так и вышло с весом и габаритами — форма их слала,
 * сервер выбрасывал, и расчёт доставки продолжал считать по средней коробке.
 */
const root = path.resolve(import.meta.dirname, "..");
const SHIPPING_FIELDS = [
  "productWeightG",
  "productLengthCm",
  "productWidthCm",
  "productHeightCm",
];

describe("вес и габариты доходят до базы", () => {
  it("правка товара их сохраняет", () => {
    const source = readFileSync(
      path.join(root, "services/product/buildProductPatchSet.js"),
      "utf8",
    );
    assert.match(source, /applyShippingDimensionFields\(body, \$set, \$unset\)/);
    for (const field of SHIPPING_FIELDS) {
      assert.ok(source.includes(field), `в патче нет поля ${field}`);
    }
  });

  it("создание товара их сохраняет", () => {
    const source = readFileSync(
      path.join(root, "services/product/postProduct.js"),
      "utf8",
    );
    for (const field of SHIPPING_FIELDS) {
      assert.match(
        source,
        new RegExp(`${field}: normalizeShippingDimension`),
        `создание не сохраняет ${field}`,
      );
    }
  });

  it("модель товара знает эти поля", () => {
    const source = readFileSync(path.join(root, "models/ProductModel.js"), "utf8");
    for (const field of SHIPPING_FIELDS) {
      assert.ok(source.includes(`${field}:`), `в модели нет ${field}`);
    }
  });
});
