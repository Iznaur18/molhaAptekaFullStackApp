import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("catalog category change drops placeholder data to avoid card mass-swap", () => {
  const queryHook = readMobileFile("entities/product/model/useCatalogProductsInfiniteQuery.ts");
  const helper = readMobileFile("entities/product/lib/shouldRetainCatalogListPlaceholderData.ts");

  assert.match(queryHook, /shouldRetainCatalogListPlaceholderData/);
  assert.doesNotMatch(queryHook, /keepPreviousData/);
  assert.match(helper, /categoryId/);
  assert.match(helper, /productCategory/);
  assert.match(helper, /shouldRetainCatalogListPlaceholderData/);
});

test("filtered catalog list disables entering animations and uses perf props", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const perf = readMobileFile("features/catalog-grid/lib/catalogGridListPerformanceProps.ts");

  assert.match(index, /renderCatalogGridRow/);
  assert.match(index, /disableEntering/);
  assert.match(index, /catalogGridListPerformanceProps/);
  assert.match(index, /catalogListScopeKey/);
  assert.match(perf, /windowSize/);
  assert.match(perf, /removeClippedSubviews/);
});

test("product media pager limits nested horizontal list mount", () => {
  const pager = readMobileFile("entities/product/ui/ProductMediaHorizontalPager.tsx");

  assert.match(pager, /nestedHorizontalScrollProps/);
  assert.match(pager, /windowSize=\{3\}/);
  assert.match(pager, /removeClippedSubviews/);
});
