import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { shouldHoldOneCProduct } = await import(
  "../services/onec/exchange/onecHeldProducts.js"
);

describe("правило приёмки 1С: нет картинок И нет остатка", () => {
  it("не пускает на сайт только при обоих признаках сразу", () => {
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: 0 }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: 3 }), false);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: 0 }), false);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: 5 }), false);
  });

  it("неизвестный остаток считает нулевым", () => {
    // Каталог CommerceML остатков не содержит: пока их нет, товар без картинок
    // ждёт в отстойнике, а не появляется на сайте «на всякий случай».
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: null }), true);
    assert.equal(
      shouldHoldOneCProduct({ hasImages: false, stock: undefined }),
      true,
    );
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: NaN }), true);
    assert.equal(shouldHoldOneCProduct({ hasImages: true, stock: null }), false);
  });

  it("отрицательный остаток — это тоже «нет остатка»", () => {
    assert.equal(shouldHoldOneCProduct({ hasImages: false, stock: -2 }), true);
  });
});
