import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

import {
  CATALOG_SEARCH_MODE_ATLAS,
  CATALOG_SEARCH_MODE_NONE,
  CATALOG_SEARCH_MODE_REGEX,
  PRODUCT_ATLAS_SEARCH_INDEX_NAME,
  PRODUCT_ATLAS_SEARCH_NAME_BOOST,
} from "../constants/productAtlasSearchConstants.js";
import {
  buildProductAtlasSearchCompound,
  buildProductAtlasSearchStage,
} from "../utils/buildProductAtlasSearchStage.js";
import { buildProductCatalogSearchQuery } from "../utils/buildProductCatalogSearchQuery.js";
import {
  getConfiguredCatalogSearchMode,
  isProductAtlasSearchEnabled,
} from "../utils/isProductAtlasSearchEnabled.js";
import { isAtlasSearchUnavailableError } from "../utils/isAtlasSearchUnavailableError.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("isProductAtlasSearchEnabled: false by default", () => {
  const previous = process.env.ATLAS_SEARCH_ENABLED;
  delete process.env.ATLAS_SEARCH_ENABLED;

  try {
    assert.equal(isProductAtlasSearchEnabled(), false);
    assert.equal(getConfiguredCatalogSearchMode(), CATALOG_SEARCH_MODE_REGEX);
  } finally {
    if (previous == null) {
      delete process.env.ATLAS_SEARCH_ENABLED;
    } else {
      process.env.ATLAS_SEARCH_ENABLED = previous;
    }
  }
});

test("isProductAtlasSearchEnabled: true when ATLAS_SEARCH_ENABLED=true", () => {
  const previous = process.env.ATLAS_SEARCH_ENABLED;
  process.env.ATLAS_SEARCH_ENABLED = "true";

  try {
    assert.equal(isProductAtlasSearchEnabled(), true);
    assert.equal(getConfiguredCatalogSearchMode(), CATALOG_SEARCH_MODE_ATLAS);
  } finally {
    if (previous == null) {
      delete process.env.ATLAS_SEARCH_ENABLED;
    } else {
      process.env.ATLAS_SEARCH_ENABLED = previous;
    }
  }
});

test("buildProductAtlasSearchCompound: text + category should clauses", () => {
  const compound = buildProductAtlasSearchCompound({
    normalizedTerm: "авто",
    categorySlugs: ["automobiles"],
    categoryNodeIds: ["507f1f77bcf86cd799439011"],
  });

  assert.equal(compound.minimumShouldMatch, 1);
  assert.equal(compound.should.length, 4);

  const nameClause =
    /** @type {{ text: { path: string; score?: { boost: { value: number } } } }} */ (
      compound.should[0]
    );
  assert.equal(nameClause.text.path, "productName");
  assert.equal(nameClause.text.score?.boost?.value, PRODUCT_ATLAS_SEARCH_NAME_BOOST);

  const blobClause = /** @type {{ text: { path: string } }} */ (compound.should[1]);
  assert.equal(blobClause.text.path, "productSearchBlob");

  const slugClause = /** @type {{ in: { path: string; value: string[] } }} */ (
    compound.should[2]
  );
  assert.deepEqual(slugClause.in.value, ["automobiles"]);

  const idClause = /** @type {{ in: { path: string } }} */ (compound.should[3]);
  assert.equal(idClause.in.path, "productCategoryId");
});

test("buildProductAtlasSearchStage uses product_catalog index", () => {
  const stage = buildProductAtlasSearchStage({
    normalizedTerm: "таблетки",
    categorySlugs: [],
    categoryNodeIds: [],
  });

  assert.equal(stage.$search.index, PRODUCT_ATLAS_SEARCH_INDEX_NAME);
  assert.equal(stage.$search.compound.should.length, 2);
});

test("buildProductCatalogSearchQuery: empty search → mode none", async () => {
  const result = await buildProductCatalogSearchQuery("", {
    productModerationStatus: "approved",
  });

  assert.equal(result.mode, CATALOG_SEARCH_MODE_NONE);
  assert.equal(result.atlasSearch, null);
  assert.deepEqual(result.query, { productModerationStatus: "approved" });
});

test("buildProductCatalogSearchQuery: regex mode by default", async () => {
  const result = await buildProductCatalogSearchQuery("витамин", {
    productModerationStatus: "approved",
  });

  assert.equal(result.mode, CATALOG_SEARCH_MODE_REGEX);
  assert.equal(result.atlasSearch, null);
  assert.ok(result.searchRank?.escapedRegexPattern);
  assert.ok(Array.isArray(result.query.$and));
});

test("buildProductCatalogSearchQuery: atlas mode when preferAtlas", async () => {
  const result = await buildProductCatalogSearchQuery(
    "витамин",
    { productModerationStatus: "approved" },
    { preferAtlas: true },
  );

  assert.equal(result.mode, CATALOG_SEARCH_MODE_ATLAS);
  assert.equal(result.searchRank, null);
  assert.equal(result.atlasSearch?.normalizedTerm, "витамин");
  assert.ok(result.query.$and);
});

test("isAtlasSearchUnavailableError detects $search failures", () => {
  assert.equal(
    isAtlasSearchUnavailableError(
      new Error("$search stage is only allowed on MongoDB Atlas"),
    ),
    true,
  );
  assert.equal(
    isAtlasSearchUnavailableError(new Error("index product_catalog not found")),
    true,
  );
  assert.equal(isAtlasSearchUnavailableError(new Error("validation failed")), false);
});
