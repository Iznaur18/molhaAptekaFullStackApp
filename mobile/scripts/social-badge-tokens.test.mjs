import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(MOBILE_ROOT, "..");
const read = (...parts) => readFileSync(join(...parts), "utf8");

test("package exports social + product badge colors", () => {
  const index = read(ROOT, "packages/design-tokens/src/index.ts");
  assert.match(index, /izSocialBrandColors/);
  assert.match(index, /izProductBadgeColors/);
});

test("mobile consumers import package tokens", () => {
  assert.match(
    read(MOBILE_ROOT, "entities/user/ui/SocialBrandIcon.tsx"),
    /izSocialBrandColors/,
  );
  assert.match(
    read(MOBILE_ROOT, "entities/product/lib/productCardBadgePalette.ts"),
    /izProductBadgeColors\.raffle/,
  );
  assert.match(
    read(MOBILE_ROOT, "entities/product/lib/productDetailsBadgeSoftPalette.ts"),
    /izProductBadgeColors\.detailsSoft/,
  );
  assert.doesNotMatch(
    read(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts"),
    /#dd2a7b|#1f7a4d/,
  );
});

test("web CSS vars mirror package social/badge accents", () => {
  const css = read(ROOT, "client/src/shared/styles/designTokens.css");
  assert.match(css, /--iz-social-whatsapp:\s*#25d366/);
  assert.match(css, /--iz-badge-raffle-bg:\s*#fdf2f8/);
  assert.match(css, /--iz-game-accent:\s*#ff7a1a/);
  assert.match(
    read(ROOT, "client/src/entities/user/ui/SellerSocialLinksSheet.css"),
    /var\(--iz-social-whatsapp\)/,
  );
  assert.match(
    read(ROOT, "client/src/entities/product/ui/product-card/ProductCardBadges.css"),
    /var\(--iz-badge-raffle-bg\)/,
  );
});
