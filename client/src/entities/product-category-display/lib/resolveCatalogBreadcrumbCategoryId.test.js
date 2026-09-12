import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { resolveCatalogBreadcrumbCategoryId } from "./resolveCatalogBreadcrumbCategoryId.js";

describe("resolveCatalogBreadcrumbCategoryId", () => {
  it("returns categoryId from trail when present", async () => {
    const id = await resolveCatalogBreadcrumbCategoryId({
      trail: [{ categoryId: "a" }, { categoryId: "b", labelRu: "B" }],
      index: 0,
      roots: [],
      fetchChildren: async () => [],
    });
    assert.equal(id, "a");
  });

  it("walks roots/children by slug when categoryId missing", async () => {
    const id = await resolveCatalogBreadcrumbCategoryId({
      trail: [
        { slug: "cakes", labelRu: "торты" },
        { slug: "cream", labelRu: "с кремом" },
      ],
      index: 1,
      roots: [{ id: "r1", slug: "cakes", labelRu: "торты" }],
      fetchChildren: async (parentId) => {
        assert.equal(parentId, "r1");
        return [{ id: "c2", slug: "cream", labelRu: "с кремом" }];
      },
    });
    assert.equal(id, "c2");
  });
});
