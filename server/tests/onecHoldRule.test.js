import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { shouldHoldOneCProduct } =
  await import("../services/onec/exchange/onecHeldProducts.js");

describe("правило приёмки 1С: без картинок на сайт не пускаем", () => {
  it("держит номенклатуру без картинок при любом остатке", () => {
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: 0 }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: 3 }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: 0 }), false);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: 5 }), false);
  });

  it("неизвестный остаток без картинок тоже hold", () => {
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: null }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: undefined }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: null }), false);
  });
});
