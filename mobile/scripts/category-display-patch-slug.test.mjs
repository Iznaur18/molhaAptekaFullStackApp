import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const resolveSource = readFileSync(
  join(root, "entities/product-category-display/lib/resolveProductCategoryDisplay.ts"),
  "utf8",
);
const modalSource = readFileSync(
  join(root, "features/catalog-browser/ui/EditCategoryDisplayModal.tsx"),
  "utf8",
);

assert.match(resolveSource, /displaySlug: string/);
assert.match(resolveSource, /displaySlug: root\.slug/);
assert.match(modalSource, /patchResolvedCategoryMutation/);
assert.match(resolveSource, /mapCategoryDisplaysById/);
assert.match(resolveSource, /Только корни из админ-дерева/);
assert.doesNotMatch(resolveSource, /for \(const legacySlug of PRODUCT_CATEGORIES\)/);

console.log("category-display-patch-slug.test.mjs: ok");
