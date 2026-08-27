import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const readMobileFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, "mobile", relativePath), "utf8");

const readClientFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, "client", relativePath), "utf8");

test("out-of-stock overlay tokens match web ProductCardOutOfStock.css", () => {
  const webCss = readClientFile("src/entities/product/ui/product-card/ProductCardOutOfStock.css");
  const layout = readMobileFile("entities/product/lib/productCardOutOfStockLayout.ts");
  const styles = readMobileFile("shared/theme/catalogProductStyles.ts");

  assert.match(webCss, /opacity:\s*0\.72/);
  assert.match(webCss, /filter:\s*grayscale\(1\)/);
  assert.match(webCss, /surface\) 55%/);
  assert.match(webCss, /surface\) 88%/);
  assert.match(webCss, /font-size:\s*0\.82rem/);

  assert.match(layout, /cardOpacity:\s*0\.72/);
  assert.match(layout, /overlaySurfaceMix:\s*0\.55/);
  assert.match(layout, /labelSurfaceMix:\s*0\.88/);
  assert.match(layout, /labelFontSize:\s*13\.12/);

  assert.match(styles, /opacity: OOS\.cardOpacity/);
  assert.match(styles, /filter: "grayscale\(1\)"/);
  assert.match(styles, /resolveProductCardOutOfStockOverlayColors/);
  assert.doesNotMatch(styles, /rgba\(148,\s*163,\s*184/);
});
