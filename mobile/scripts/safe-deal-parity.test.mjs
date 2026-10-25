import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { isSellerSafeDealApproved, isValidInn } from "@molha/api-contract";

import { resolveWebPathToMobileRoute } from "../features/deep-linking/lib/resolveWebPathToMobileRoute.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("раздел «Безопасная сделка»: в «Сервисах», ссылка с сайта ведёт в приложение", () => {
  assert.match(
    read("features/profile-hub/model/buildProfileNavGroups.ts"),
    /sectionId === "safe-deal" && access\.isProfileReady/,
  );
  assert.match(
    read("features/profile-hub/ui/HubSectionContent.tsx"),
    /<SafeDealPage \/>/,
  );
  assert.equal(resolveWebPathToMobileRoute("/profile/safe-deal"), "/hub/safe-deal");
});

test("форма: ИП/ООО, ИНН по длине и контрольной сумме, как на сайте", () => {
  const page = read("features/safe-deal-page/ui/SafeDealPage.tsx");
  assert.match(page, /isInnLengthValidForLegalForm\(legalForm, inn\)/);
  assert.match(page, /isValidInn\(inn\)/);
  // Пробелы и дефисы из выписки чистим молча.
  assert.match(page, /raw\.replace\(\/\\D\/g, ""\)/);
  // На проверке и после подключения поля закрыты, переподача — с прежними данными.
  assert.match(page, /const isLocked = isPending \|\| isApproved;/);
  assert.match(page, /setForm\(\{ legalForm: safeDeal\.legalForm/);
  assert.match(page, /SAFE_DEAL_UI\.RESUBMIT/);
  // Тестовые ИНН из плейсхолдеров сайта проходят проверку.
  assert.equal(isValidInn("500100732259"), true);
  assert.equal(isValidInn("2368017598"), true);
  assert.equal(isValidInn("2368017599"), false);
});

test("значок продавца там же, где на сайте", () => {
  assert.equal(
    isSellerSafeDealApproved({ sellerSafeDeal: { moderationStatus: "approved" } }),
    true,
  );
  assert.match(read("entities/user/ui/UserPremiumDisplayName.tsx"), /hasSafeDeal \?/);
  assert.match(
    read("entities/product/lib/getProductSellerProfile.ts"),
    /isSellerSafeDealApproved\(seller\)/,
  );
  for (const file of [
    "entities/product/ui/ProductCardSellerRow.tsx",
    "entities/product/ui/ProductDetailsSellerPreview.tsx",
    "features/user-details-page/ui/UserDetailsHeader.tsx",
    "features/seller-products-page/ui/SellerProductsPage.tsx",
  ]) {
    assert.match(read(file), /hasSafeDeal=\{/, file);
  }
  assert.match(
    read("entities/product/lib/buildProductDetailsBadgeItems.ts"),
    /kind: "safeDeal"/,
  );
  assert.match(
    read("entities/product-badge-explain/lib/resolveProductBadgeExplainSheet.ts"),
    /badgeKey: "safe_deal"/,
  );
  // Пока заморозки денег нет — значок не обещает защиту, как на сайте.
  const web = read(
    "../client/src/entities/seller-safe-deal/model/isSafeDealEscrowEnabled.js",
  );
  const mobile = read("entities/seller-safe-deal/lib/safeDealBadgeCopy.ts");
  const flag = /IS_SAFE_DEAL_ESCROW_ENABLED = (true|false)/;
  assert.equal(flag.exec(mobile)?.[1], flag.exec(web)?.[1]);
});

test("тексты раздела совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/safe-deal.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const key of [
    "INTRO",
    "LEGAL_NOTE",
    "APPROVED_HINT",
    "PENDING_HINT",
    "HINT_INN_IP",
    "HINT_INN_OOO",
    "PRIVACY_NOTE",
  ]) {
    const value = new RegExp(`\\n  ${key}:\\s*"([^"]+)"`).exec(web)?.[1];
    assert.ok(value, key);
    assert.ok(mobile.includes(`"${value}"`), key);
  }
});
