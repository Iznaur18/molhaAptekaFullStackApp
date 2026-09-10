import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("admin toggles product moderation trust from user details", () => {
  const api = readMobileFile("entities/user/api/patchSellerProductModerationTrust.ts");
  const control = readMobileFile(
    "entities/user/ui/AdminProductModerationTrustControl.tsx",
  );
  const page = readMobileFile("features/user-details-page/ui/UserDetailsPage.tsx");
  const pageModel = readMobileFile(
    "features/user-details-page/model/useUserDetailsPage.ts",
  );

  assert.match(
    api,
    /\/staff\/sellers\/\$\{encodeURIComponent\(userId\)\}\/product-moderation-trust/,
  );
  assert.match(api, /productModerationTrusted/);

  assert.match(control, /Alert\.alert/);
  assert.match(control, /CONFIRM_GRANT/);
  assert.match(control, /CONFIRM_REVOKE/);
  assert.match(control, /trustMutation\.error instanceof Error/);

  assert.match(page, /AdminProductModerationTrustControl/);
  assert.match(page, /isAdmin && !isSelf/);
  assert.match(pageModel, /handleModerationTrustChange/);
});

test("trusted seller sees notice in my products toolbar", () => {
  const toolbar = readMobileFile(
    "features/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.tsx",
  );
  const page = readMobileFile("features/my-products-page/ui/MyProductsPage.tsx");
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(toolbar, /isModerationTrusted/);
  assert.match(toolbar, /TRUSTED_NOTICE/);
  assert.match(page, /productModerationTrusted === true/);
  assert.match(page, /isModerationTrusted=\{isModerationTrusted\}/);
  assert.match(copy, /TRUSTED_NOTICE: "Ваши товары публикуются без проверки"/);
});
