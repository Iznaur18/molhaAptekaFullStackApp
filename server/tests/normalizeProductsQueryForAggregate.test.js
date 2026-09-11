import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mongoose from "mongoose";

const { normalizeProductsQueryForAggregate } =
  await import("../services/product/productCatalogQuery.js");

const { ObjectId } = mongoose.Types;

describe("normalizeProductsQueryForAggregate", () => {
  it("casts top-level productSeller string to ObjectId", () => {
    const id = new ObjectId().toString();
    const result = normalizeProductsQueryForAggregate({
      productSeller: id,
    });
    assert.ok(result.productSeller instanceof ObjectId);
    assert.equal(String(result.productSeller), id);
  });

  it("casts productSeller nested under $and (catalog search)", () => {
    const id = new ObjectId().toString();
    const result = normalizeProductsQueryForAggregate({
      $and: [
        { productSeller: id, productModerationStatus: "approved" },
        { productName: { $regex: "часы", $options: "i" } },
      ],
    });

    assert.ok(Array.isArray(result.$and));
    assert.ok(result.$and[0].productSeller instanceof ObjectId);
    assert.equal(String(result.$and[0].productSeller), id);
    assert.deepEqual(result.$and[1], {
      productName: { $regex: "часы", $options: "i" },
    });
  });

  it("casts productSeller nested under $nor", () => {
    const id = new ObjectId().toString();
    const result = normalizeProductsQueryForAggregate({
      $nor: [{ productSeller: id }],
    });
    assert.ok(result.$nor[0].productSeller instanceof ObjectId);
  });
});
