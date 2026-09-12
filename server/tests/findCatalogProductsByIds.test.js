import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { findCatalogProductsByIds } from "../services/product/findCatalogProductsByIds.js";

describe("findCatalogProductsByIds", () => {
  it("пустой/битый ввод → []", async () => {
    assert.deepEqual(await findCatalogProductsByIds([]), []);
    assert.deepEqual(await findCatalogProductsByIds(["not-an-id"]), []);
  });
});
