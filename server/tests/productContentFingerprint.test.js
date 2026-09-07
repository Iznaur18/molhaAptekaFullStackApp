import assert from "node:assert/strict";
import { describe, it } from "node:test";

import mongoose from "mongoose";

const { buildProductModerationFingerprint, hashStableValue } = await import(
  "../services/product/productContentFingerprint.js"
);
const { buildOneCContentHash } = await import(
  "../services/onec/exchange/onecProductFields.js"
);

describe("отпечаток содержимого", () => {
  it("не зависит от порядка ключей", () => {
    assert.equal(
      hashStableValue({ a: 1, b: [{ x: 1, y: 2 }] }),
      hashStableValue({ b: [{ y: 2, x: 1 }], a: 1 }),
    );
  });

  it("различает ObjectId'ы, а не сводит их к пустому объекту", () => {
    const first = new mongoose.Types.ObjectId();
    const second = new mongoose.Types.ObjectId();

    assert.notEqual(hashStableValue({ c: first }), hashStableValue({ c: second }));
    // Категория, прочитанная из lean-документа строкой, — та же категория.
    assert.equal(hashStableValue({ c: first }), hashStableValue({ c: String(first) }));
  });
});

describe("отпечаток одобренного содержимого", () => {
  const approved = {
    productName: "Аспирин 500 мг",
    productDescription: "Таблетки, 20 шт",
    productImageUrls: ["/uploads/a.webp"],
    productCategoryId: new mongoose.Types.ObjectId(),
    productCharacteristics: [{ key: "Форма", value: "таблетки" }],
  };

  it("не меняется от цены, остатка и служебных полей обмена", () => {
    assert.equal(
      buildProductModerationFingerprint(approved),
      buildProductModerationFingerprint({
        ...approved,
        productPrice: 999,
        productStockQuantity: 0,
        productIsAvailable: false,
        product1cSeenAt: new Date(),
      }),
    );
  });

  it("меняется от всего, что смотрит модератор", () => {
    const base = buildProductModerationFingerprint(approved);

    for (const patch of [
      { productName: "Аспирин 100 мг" },
      { productDescription: "другое описание" },
      { productImageUrls: ["/uploads/b.webp"] },
      { productCategoryId: new mongoose.Types.ObjectId() },
      { productCharacteristics: [{ key: "Форма", value: "капсулы" }] },
    ]) {
      assert.notEqual(
        buildProductModerationFingerprint({ ...approved, ...patch }),
        base,
        `правка ${Object.keys(patch)[0]} должна менять отпечаток`,
      );
    }
  });
});

describe("отпечаток присланного 1С", () => {
  const fields = {
    productName: "Аспирин 500 мг",
    productDescription: "Таблетки, 20 шт",
    productImageUrls: ["/uploads/a.webp"],
    productCategoryId: new mongoose.Types.ObjectId(),
  };

  it("не зависит от метки «когда видели»: она меняется каждый обмен", () => {
    assert.equal(
      buildOneCContentHash({ ...fields, product1cSeenAt: new Date(0) }),
      buildOneCContentHash({ ...fields, product1cSeenAt: new Date() }),
    );
  });

  it("реагирует на любое присланное поле", () => {
    assert.notEqual(
      buildOneCContentHash(fields),
      buildOneCContentHash({ ...fields, productArticle: "ASP-500" }),
    );
  });
});
