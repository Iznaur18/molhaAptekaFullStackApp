import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("seller meta row matches web layout tokens", () => {
  const layout = readFile(
    MOBILE_ROOT,
    "features/seller-products-page/lib/sellerProductsPageLayout.ts",
  );
  const page = readFile(
    MOBILE_ROOT,
    "features/seller-products-page/ui/SellerProductsPage.tsx",
  );
  const share = readFile(MOBILE_ROOT, "entities/user/ui/SellerShareLinkButton.tsx");
  const follow = readFile(MOBILE_ROOT, "features/user-follow/ui/UserFollowButton.tsx");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/pages/seller-products/ui/SellerProductsPage.css",
  );
  const webShareCss = readFile(
    CLIENT_ROOT,
    "src/entities/user/ui/SellerShareLinkButton.css",
  );

  assert.match(layout, /metaZoneBorderRadius: 20/);
  assert.match(layout, /metaZonePaddingVertical: 12/);
  assert.match(layout, /shareMetaSize: 34/);
  assert.match(page, /layout="sellerMeta"/);
  assert.match(page, /singleLine/);
  assert.match(
    readFile(MOBILE_ROOT, "shared/theme/userPremiumStyles.ts"),
    /textClip:/,
  );
  assert.match(
    readFile(MOBILE_ROOT, "shared/theme/userPremiumStyles.ts"),
    /textOverflow: "ellipsis"/,
  );
  assert.match(page, /PRODUCT_CARD_UI\.SELLER_PROFILE_ARIA/);
  assert.match(share, /width: L\.shareMetaSize/);
  assert.match(share, /flexShrink: 0/);
  assert.match(follow, /layout === "sellerMeta"/);
  assert.match(webCss, /padding: 12px 14px/);
  assert.match(webCss, /border-radius: 1\.25rem/);
  assert.match(webShareCss, /width: 2\.125rem/);
  assert.match(webShareCss, /height: 2\.125rem/);
});
