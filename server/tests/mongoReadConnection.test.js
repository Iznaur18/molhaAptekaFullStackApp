import assert from "node:assert/strict";
import { describe, it } from "node:test";

import ProductModel from "../models/ProductModel.js";
import {
  getCatalogProductModel,
  isMongoReadConnectionConfigured,
} from "../db/mongoReadConnection.js";

describe("mongoReadConnection", () => {
  it("isMongoReadConnectionConfigured reflects MONGO_URI_READ", () => {
    const previous = process.env.MONGO_URI_READ;
    try {
      delete process.env.MONGO_URI_READ;
      assert.equal(isMongoReadConnectionConfigured(), false);

      process.env.MONGO_URI_READ = "mongodb://127.0.0.1:27017/read";
      assert.equal(isMongoReadConnectionConfigured(), true);
    } finally {
      if (previous === undefined) {
        delete process.env.MONGO_URI_READ;
      } else {
        process.env.MONGO_URI_READ = previous;
      }
    }
  });

  it("getCatalogProductModel falls back to primary Product model", () => {
    assert.equal(getCatalogProductModel(), ProductModel);
  });
});
