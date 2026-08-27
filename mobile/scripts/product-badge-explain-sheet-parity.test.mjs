import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("product badge explain sheet matches web panel layout", () => {
  const layout = readFile(MOBILE_ROOT, "shared/lib/productBadgeExplainSheetLayout.ts");
  const sheet = readFile(
    MOBILE_ROOT,
    "entities/product-badge-explain/ui/ProductBadgeExplainSheet.tsx",
  );
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product-badge-explain/ui/ProductBadgeExplainSheet.css",
  );

  assert.match(layout, /panelMaxWidth: 480/);
  assert.match(layout, /enterMs: 280/);
  assert.match(layout, /exitMs: 220/);
  assert.match(layout, /enterEasingCss: "cubic-bezier\(0.215, 0.61, 0.355, 1\)"/);
  assert.match(sheet, /useCssTransition \? View : Animated\.View/);
  assert.match(
    readFile(
      MOBILE_ROOT,
      "entities/product-badge-explain/model/useProductBadgeExplainSheetAnimation.ts",
    ),
    /scheduleOpenAfterPaint/,
  );
  assert.match(
    readFile(
      MOBILE_ROOT,
      "entities/product-badge-explain/model/useProductBadgeExplainSheetAnimation.ts",
    ),
    /transitionProperty: "transform"/,
  );
  assert.match(layout, /mediaAspectRatio: 16 \/ 9/);
  assert.match(sheet, /ModalSheetGradientBackdrop/);
  assert.match(sheet, /useProductBadgeExplainSheetAnimation/);
  assert.match(sheet, /animationType="none"/);
  assert.match(webCss, /max-width: 30rem/);
  assert.match(webCss, /aspect-ratio: 16 \/ 9/);
});

test("product details badge chips use web soft palette sizes", () => {
  const palette = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productDetailsBadgeSoftPalette.ts",
  );
  const badgeLayout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productCardBadgePalette.ts",
  );
  const stack = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailsBadgeStack.tsx");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalPrice.css",
  );

  assert.match(palette, /listingOrigin: \{ backgroundColor: "#e0f2fe", color: "#0369a1" \}/);
  assert.match(badgeLayout, /paddingVertical: 3\.5/);
  assert.match(badgeLayout, /fontSize: 10\.4/);
  assert.match(stack, /BadgePressable/);
  assert.match(webCss, /padding: 3\.5px 9px/);
  assert.match(webCss, /font-size: 10\.4px/);
});
