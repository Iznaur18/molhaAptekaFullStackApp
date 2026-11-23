import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("product compact/list card geometry matches web ProductCardListLayout", () => {
  const layout = readMobile("entities/product/lib/productCompactCardLayout.ts");
  const styles = readMobile("shared/theme/productCompactCardStyles.ts");
  const webCss = readClient(
    "entities/product/ui/product-card/ProductCardListLayout.css",
  );

  assert.match(webCss, /\.product-card--list[\s\S]*gap:\s*0\.55rem/);
  assert.match(webCss, /padding:\s*0\.6rem 0\.7rem/);
  assert.match(webCss, /grid-template-columns:\s*112px/);
  assert.match(webCss, /\.product-card__image-frame[\s\S]*width:\s*112px/);
  assert.match(webCss, /border-radius:\s*16px/);
  assert.match(webCss, /@media \(max-width: 640px\)[\s\S]*width:\s*96px/);

  assert.match(layout, /cardGap: 8\.8/);
  assert.match(layout, /paddingVertical: 9\.6/);
  assert.match(layout, /paddingHorizontal: 11\.2/);
  assert.match(layout, /thumbSize: 112/);
  assert.match(layout, /thumbSizeNarrow: 96/);
  assert.match(layout, /thumbRadius: 16/);
  assert.match(layout, /cardRadius: 20/);
  assert.match(layout, /topRowGap: 12/);

  assert.match(styles, /PRODUCT_COMPACT_CARD_LAYOUT/);
  assert.match(styles, /resolveProductCompactCardThumbSize/);
  assert.match(styles, /paddingVertical: L\.paddingVertical/);
  assert.match(styles, /paddingHorizontal: L\.paddingHorizontal/);
  assert.match(styles, /gap: L\.cardGap/);
  assert.doesNotMatch(styles, /THUMB_SIZE = 88/);
  assert.doesNotMatch(styles, /padding: 12/);
});

test("catalog mini card tokens stay ALIGNED with web mobile catalog", () => {
  const layout = readMobile(
    "entities/product/lib/productCardMobileCatalogLayout.ts",
  );
  const palette = readMobile("entities/product/lib/productCardBadgePalette.ts");
  const tokens = readClient(
    "entities/product/ui/product-card/productCardTokens.css",
  );
  const styles = readMobile("shared/theme/catalogProductStyles.ts");
  const frame = readClient("entities/product/ui/product-card/ProductCardFrame.css");

  assert.match(layout, /imageTopRadius: 15/);
  assert.match(layout, /imageBottomRadius: 10/);
  assert.match(layout, /actionHeight: 34\.4/);
  assert.match(layout, /contentInsetX: 10/);
  assert.match(layout, /nameFontSize: 14/);

  assert.match(tokens, /--product-card-overlay-badge-radius:\s*6px/);
  assert.match(tokens, /--product-card-overlay-badge-pad-y:\s*2px/);
  assert.match(tokens, /--product-card-overlay-badge-pad-x:\s*10px/);
  assert.match(tokens, /--product-card-overlay-badge-font-size:\s*10px/);
  assert.match(tokens, /--product-card-overlay-badge-line-height:\s*12px/);
  assert.match(palette, /borderRadius: 6/);
  assert.match(palette, /paddingVertical: 2/);
  assert.match(palette, /paddingHorizontal: 10/);
  assert.match(palette, /fontSize: 10/);
  assert.match(palette, /lineHeight: 12/);

  assert.match(styles, /borderRadius: theme\.radius\.cardLg/);
  assert.match(styles, /borderCurve: "continuous"/);
  assert.match(styles, /cornerShape: "squircle"/);
  assert.match(frame, /corner-shape:\s*squircle/);
});
