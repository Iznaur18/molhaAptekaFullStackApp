import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { catalogProductsByIdsQuerySchema } from "@molha/api-contract";

describe("catalogProductsByIdsQuerySchema", () => {
  it("парсит ids через запятую", () => {
    const parsed = catalogProductsByIdsQuerySchema.parse({
      ids: "6aa0160770c1f477e255b2b3,6aa2c146d7beb0c5ba658e0c",
    });
    assert.deepEqual(parsed.ids, [
      "6aa0160770c1f477e255b2b3",
      "6aa2c146d7beb0c5ba658e0c",
    ]);
  });

  it("принимает пустой список", () => {
    const parsed = catalogProductsByIdsQuerySchema.parse({ ids: "" });
    assert.deepEqual(parsed.ids, []);
  });
});
