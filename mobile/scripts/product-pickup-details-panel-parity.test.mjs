import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("product pickup details panel matches web method row layout", () => {
  const layout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productPickupDetailsPanelLayout.ts",
  );
  const panel = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductPickupDetailsPanel.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductPickupDetailsPanel.css",
  );

  assert.match(layout, /methodPaddingVertical: 12/);
  assert.match(layout, /methodPaddingHorizontal: 14/);
  assert.match(layout, /iconSize: 44/);
  assert.match(layout, /actionMaxWidth: 120/);
  assert.match(webCss, /padding: 0\.75rem 0\.875rem/);
  assert.match(webCss, /width: 2\.75rem/);
  assert.match(webCss, /max-width: 7\.5rem/);
  assert.match(panel, /productPickupLocationsFromProduct/);
  assert.match(panel, /styles\.action/);
  assert.match(panel, /MapPin/);
  assert.match(panel, /Truck/);
  assert.match(panel, /DETAILS_LOCATION_DEFAULT/);
  assert.doesNotMatch(panel, /alignSelf: "flex-start"/);
  assert.match(styles, /useProductPickupDetailsPanelStyles/);
  assert.match(styles, /alignItems: "center"/);
});
