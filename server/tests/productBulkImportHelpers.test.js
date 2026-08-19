import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildLeafCategoryBreadcrumbPath,
  normalizeCategoryBreadcrumbKey,
  parseCategoryBreadcrumbParts,
} from "../services/product/bulkImport/buildLeafCategoryBreadcrumbPath.js";
import { parseBulkImportImageUrls } from "../services/product/bulkImport/prevalidateBulkImportImageUrl.js";

describe("product bulk import helpers", () => {
  it("parseCategoryBreadcrumbParts splits common separators", () => {
    assert.deepEqual(parseCategoryBreadcrumbParts("Аптека > Витамины › C"), [
      "Аптека",
      "Витамины",
      "C",
    ]);
  });

  it("parseBulkImportImageUrls splits semicolon and comma", () => {
    assert.deepEqual(parseBulkImportImageUrls("https://a.test/1.jpg; https://b.test/2.png"), [
      "https://a.test/1.jpg",
      "https://b.test/2.png",
    ]);
  });

  it("buildLeafCategoryBreadcrumbPath avoids duplicate leaf label", () => {
    const path = buildLeafCategoryBreadcrumbPath({
      pathLabelRu: ["Электроника", "Телефоны", "Смартфоны"],
      labelRu: "Смартфоны",
    });
    assert.equal(path, "Электроника › Телефоны › Смартфоны");
  });

  it("normalizeCategoryBreadcrumbKey is separator agnostic", () => {
    assert.equal(
      normalizeCategoryBreadcrumbKey("Аптека > Витамины"),
      normalizeCategoryBreadcrumbKey("Аптека › Витамины"),
    );
  });
});
