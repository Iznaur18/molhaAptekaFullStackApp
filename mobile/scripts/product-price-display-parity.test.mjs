import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("card price colors follow theme action token (web ProductPriceDisplay parity)", () => {
  const paletteSource = readMobileFile("entities/product/lib/productCardBadgePalette.ts");
  const stylesSource = readMobileFile("shared/theme/catalogProductStyles.ts");
  const priceDisplaySource = readMobileFile("entities/product/ui/ProductPriceDisplay.tsx");
  const webCss = readFileSync(
    join(MOBILE_ROOT, "..", "client/src/entities/product/ui/ProductPriceDisplay.css"),
    "utf8",
  );

  assert.match(paletteSource, /priceCurrent: c\.action/);
  assert.match(paletteSource, /resolveProductPriceDisplayOldColor/);
  assert.match(paletteSource, /mixHexColors\(c\.text, c\.surface, 0\.52\)/);
  assert.match(paletteSource, /priceOld: resolveProductPriceDisplayOldColor\(c\)/);
  assert.doesNotMatch(paletteSource, /#93c5fd/);

  assert.match(stylesSource, /current:[\s\S]*color: theme\.colors\.action/);
  assert.match(stylesSource, /old:[\s\S]*color: BC\.priceOld/);
  assert.match(stylesSource, /cardOld:[\s\S]*color: BC\.priceOld/);
  assert.match(priceDisplaySource, /\(variant === "card" \|\| isCatalogGrid\) && styles\.cardOld/);
  assert.match(priceDisplaySource, /cardRootCatalogGrid/);

  assert.match(webCss, /product-price-display__current[\s\S]*var\(--iz-color-action\)/);
  assert.match(webCss, /product-price-display__old[\s\S]*color-mix\(in srgb, currentColor 52%, transparent\)/);
});
