import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("promoted product card: no outline", () => {
  it("web ProductCardFrame — no tier border", () => {
    const css = readFileSync(
      join(
        root,
        "../client/src/entities/product/ui/product-card/ProductCardFrame.css",
      ),
      "utf8",
    );
    assert.match(css, /product-card-promotion-frame--tier-1[\s\S]*?border:\s*none/);
    assert.match(css, /product-card-promotion-frame--tier-2[\s\S]*?border:\s*none/);
    assert.match(css, /product-card-promotion-frame--tier-3[\s\S]*?border:\s*none/);
    assert.doesNotMatch(
      css,
      /product-card-promotion-frame--tier-1[\s\S]*?border:\s*2px solid/,
    );
  });

  it("mobile compact promo palette — borderWidth 0", () => {
    const palette = readFileSync(
      join(
        root,
        "entities/product/lib/productCardPromotionFramePalette.ts",
      ),
      "utf8",
    );
    const compactFn = palette.slice(
      palette.indexOf("resolveProductCardPromotionCompactFrame"),
      palette.indexOf("resolveProductCardPremiumOnlyFrame"),
    );
    assert.match(compactFn, /borderWidth:\s*0/);
    assert.doesNotMatch(compactFn, /borderWidth:\s*2/);
  });
});
