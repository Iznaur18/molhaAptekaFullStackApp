import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  buildMyProductsListFilterQuery,
  parseMyProductsListFilter,
  shouldExcludeHiddenOneCFromMyProducts,
} = await import("../services/product/myProductsListFilter.js");

describe("myProductsListFilter", () => {
  it("парсит только известные значения", () => {
    assert.equal(parseMyProductsListFilter(""), null);
    assert.equal(parseMyProductsListFilter("pending"), "pending");
    assert.equal(parseMyProductsListFilter("approved"), "approved");
    assert.equal(parseMyProductsListFilter("hidden"), "hidden");
    assert.equal(parseMyProductsListFilter("promoted"), "promoted");
    assert.equal(parseMyProductsListFilter("not_promoted"), "not_promoted");
    assert.equal(parseMyProductsListFilter("nope"), null);
  });

  it("строит mongo-условия", () => {
    const now = new Date("2026-09-09T12:00:00.000Z");
    assert.deepEqual(buildMyProductsListFilterQuery({ listFilter: "approved" }), {
      productModerationStatus: "approved",
    });
    assert.deepEqual(buildMyProductsListFilterQuery({ listFilter: "hidden" }), {
      productIsAvailable: false,
    });
    assert.deepEqual(
      buildMyProductsListFilterQuery({ listFilter: "promoted", now }),
      { catalogPromotionExpiresAt: { $gt: now } },
    );
    assert.deepEqual(
      buildMyProductsListFilterQuery({ listFilter: "not_promoted", now }),
      {
        $or: [
          { catalogPromotionExpiresAt: null },
          { catalogPromotionExpiresAt: { $exists: false } },
          { catalogPromotionExpiresAt: { $lte: now } },
        ],
      },
    );
  });

  it("для hidden не исключает 1С-unavailable", () => {
    assert.equal(shouldExcludeHiddenOneCFromMyProducts("hidden"), false);
    assert.equal(shouldExcludeHiddenOneCFromMyProducts(null), true);
    assert.equal(shouldExcludeHiddenOneCFromMyProducts("approved"), true);
  });
});
