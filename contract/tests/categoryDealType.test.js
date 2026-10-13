import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CATEGORY_DEAL_TYPES_WITHOUT_CART,
  isCartDealType,
  isProductPurchasableViaCart,
  normalizeCategoryDealType,
  normalizeCategoryOwnDealType,
} from "../src/categoryDealType.js";
import { patchProductCategoryAdminBodySchema } from "../src/productCategoryAdmin.js";

describe("categoryDealType contract", () => {
  it("пустое и незнакомое значение читается как обычный товар", () => {
    assert.equal(normalizeCategoryDealType(undefined), "goods");
    assert.equal(normalizeCategoryDealType(null), "goods");
    assert.equal(normalizeCategoryDealType("rent"), "goods");
    assert.equal(normalizeCategoryDealType("viewing"), "viewing");
  });

  it("собственный тип узла: незнакомое значение — наследовать", () => {
    assert.equal(normalizeCategoryOwnDealType(""), null);
    assert.equal(normalizeCategoryOwnDealType("rent"), null);
    assert.equal(normalizeCategoryOwnDealType("service"), "service");
  });

  it("через корзину идёт только обычный товар", () => {
    assert.equal(isCartDealType("goods"), true);
    assert.equal(isCartDealType("viewing"), false);
    assert.equal(isCartDealType("service"), false);
    assert.deepEqual(CATEGORY_DEAL_TYPES_WITHOUT_CART, ["viewing", "service"]);
  });

  it("товар без поля — покупаемый: так выглядят все старые карточки", () => {
    assert.equal(isProductPurchasableViaCart({}), true);
    assert.equal(isProductPurchasableViaCart(null), true);
    assert.equal(isProductPurchasableViaCart({ productDealType: "viewing" }), false);
  });

  it("схема правки категории не срезает тип сделки и пропускает сброс", () => {
    assert.deepEqual(
      patchProductCategoryAdminBodySchema.parse({ dealType: "viewing" }),
      {
        dealType: "viewing",
      },
    );
    assert.deepEqual(patchProductCategoryAdminBodySchema.parse({ dealType: null }), {
      dealType: null,
    });
    assert.equal(
      patchProductCategoryAdminBodySchema.safeParse({ dealType: "rent" }).success,
      false,
    );
  });
});
