import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "../errors/AppError.js";
import { buildProductPatchSet } from "../services/product/buildProductPatchSet.js";
import { CATALOG_VISIBILITY_BLOCK_MESSAGE } from "../services/product/patchMyProductConstants.js";

const pendingProduct = {
  productModerationStatus: "pending",
  productModerationComment: "wait",
  productIsAvailable: false,
  productName: "Old",
  productDescription: "Desc",
  productPrice: 100,
  productOldPrice: null,
  productAuctionEnabled: false,
  productPreviewVideoUrl: "",
  productImageUrls: ["https://example.com/a.jpg"],
};

describe("buildProductPatchSet pending owner edit", () => {
  it("allows content PATCH while pending and keeps status", async () => {
    const { $set } = await buildProductPatchSet({
      existing: pendingProduct,
      body: { productName: "New title" },
      isAdmin: false,
      productId: "507f1f77bcf86cd799439011",
    });

    assert.equal($set.productName, "New title");
    assert.equal($set.productModerationStatus, undefined);
    assert.equal($set.productIsAvailable, undefined);
  });

  it("resubmits approved content edit to pending", async () => {
    const { $set } = await buildProductPatchSet({
      existing: {
        ...pendingProduct,
        productModerationStatus: "approved",
        productIsAvailable: true,
      },
      body: { productName: "Edited" },
      isAdmin: false,
      productId: "507f1f77bcf86cd799439011",
    });

    assert.equal($set.productName, "Edited");
    assert.equal($set.productModerationStatus, "pending");
    assert.equal($set.productIsAvailable, false);
    assert.equal($set.productModerationComment, "");
  });

  it("still blocks catalog visibility while pending", async () => {
    await assert.rejects(
      () =>
        buildProductPatchSet({
          existing: pendingProduct,
          body: { productIsAvailable: true },
          isAdmin: false,
          productId: "507f1f77bcf86cd799439011",
        }),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 409 &&
        error.message === CATALOG_VISIBILITY_BLOCK_MESSAGE,
    );
  });
});
