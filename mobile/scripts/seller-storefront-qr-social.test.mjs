import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  getMissingSellerSocialFields,
  getSellerSocialLinks,
} from "../entities/user/lib/getSellerSocialLinks.ts";
import {
  buildSellerQrMatrix,
  buildSellerQrSvgPath,
  resolveSellerQrViewBoxSize,
  SELLER_QR_QUIET_ZONE,
} from "../entities/user/lib/sellerQrMatrix.ts";
import { resolveWebPathToMobileRoute } from "../features/deep-linking/lib/resolveWebPathToMobileRoute.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("соцсети продавца: порядок как на сайте, чужие схемы не пускаем", () => {
  const links = getSellerSocialLinks({
    socialWebsiteUrl: "https://shop.example",
    socialInstagramUrl: "https://instagram.com/shop",
    socialVkUrl: "javascript:alert(1)",
    socialTelegramUrl: "  ",
  });
  assert.deepEqual(
    links.map((link) => link.id),
    ["socialInstagramUrl", "socialWebsiteUrl"],
  );
  assert.equal(links[0].label, "Instagram");

  const missing = getMissingSellerSocialFields(links).map((field) => field.id);
  assert.deepEqual(missing, [
    "socialWhatsappUrl",
    "socialTelegramUrl",
    "socialYoutubeUrl",
    "socialVkUrl",
  ]);
  assert.deepEqual(getSellerSocialLinks(null), []);
});

test("QR: та же матрица и тихая зона, что у сайта", () => {
  const matrix = buildSellerQrMatrix("https://gitorg.ru/seller/abc?src=qr");
  assert.ok(matrix.length >= 21);
  assert.equal(matrix.length, matrix[0].length);
  assert.equal(
    resolveSellerQrViewBoxSize(matrix),
    matrix.length + 2 * SELLER_QR_QUIET_ZONE,
  );
  // Левый верхний поисковый узор начинается сразу за тихой зоной.
  assert.match(
    buildSellerQrSvgPath(matrix),
    new RegExp(`^M${SELLER_QR_QUIET_ZONE} ${SELLER_QR_QUIET_ZONE}h1v1h-1z`),
  );

  const webMatrix = read("../client/src/entities/user/lib/sellerQrMatrix.js");
  assert.match(webMatrix, /qrcode\(0, "M"\)/);
  assert.match(read("entities/user/lib/sellerQrMatrix.ts"), /qrcode\(0, "M"\)/);
  assert.match(webMatrix, /SELLER_QR_QUIET_ZONE = 4/);
});

test("QR-код ведёт на постоянный адрес витрины с меткой src=qr", () => {
  const button = read("entities/user/ui/SellerQrButton.tsx");
  assert.match(button, /buildSellerQrPath\(sellerId\)/);
  assert.match(button, /WEB_APP_BASE_URL/);
  // Переходы — только владельцу.
  assert.match(button, /enabled: isOpen && isOwn/);

  // Приложение перехватило ссылку с кода — метка доходит до витрины.
  const deepLink = read("features/deep-linking/lib/parseAppDeepLink.ts");
  assert.match(deepLink, /keepSellerQrMark\(/);
  assert.equal(resolveWebPathToMobileRoute("/seller/abc"), "/seller/abc");

  const page = read("features/seller-products-page/ui/SellerProductsPage.tsx");
  assert.match(page, /cameFromQr: params\.src === SELLER_QR_SOURCE_VALUE/);
});

test("витрина: кнопки как на сайте — на баннере для всех, без баннера у имени", () => {
  const page = read("features/seller-products-page/ui/SellerProductsPage.tsx");
  assert.match(page, /bannerAction=\{storefrontActions\("banner"\)\}/);
  assert.match(page, /isSelf && !hasProfileBanner \?/);
  assert.match(page, /!hasProfileBanner \? storefrontActions\("meta"\) : null/);
  assert.match(page, /<SellerQrButton/);
  assert.match(page, /<SellerSocialLinksButton/);

  const social = read("entities/user/ui/SellerSocialLinksButton.tsx");
  // У чужой витрины без ссылок кнопки нет.
  assert.match(social, /if \(links\.length === 0 && !isSelf\)/);
  // Ссылка не открылась — человек видит ошибку.
  assert.match(social, /setOpenError\(SELLER_SOCIAL_LINKS_UI\.OPEN_ERROR\)/);
});

test("тексты окон совпадают с сайтом", () => {
  const webQr = read("../client/src/shared/config/copy/seller-qr.js");
  const webSocial = read("../client/src/shared/config/copy/seller-social.js");
  const mobile = read("shared/config/appUiCopy.ts");
  const pairs = [
    [webQr, ["TITLE", "CARD_CAPTION", "STATS_TITLE", "STATS_EMPTY", "STATS_NOTE"]],
    [webSocial, ["TITLE", "ADD_TITLE", "ADD_HINT", "ADD_ROW_HINT"]],
  ];
  for (const [web, keys] of pairs) {
    for (const key of keys) {
      const value = new RegExp(`\\n  ${key}:\\s*"([^"]+)"`).exec(web)?.[1];
      assert.ok(value, key);
      assert.ok(mobile.includes(`"${value}"`), key);
    }
  }
});
