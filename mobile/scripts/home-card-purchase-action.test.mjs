import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  PRODUCT_CARD_MOBILE_CATALOG_LAYOUT as MCL,
  resolveProductCardCatalogGridTotalHeight,
} from "../entities/product/lib/productCardMobileCatalogLayout.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("карточка главной: место под кнопку как на сайте (0.5rem + 2.15rem)", () => {
  assert.equal(MCL.actionHeight, 34.4);
  assert.equal(MCL.actionTopGap, 8);
  const plain = resolveProductCardCatalogGridTotalHeight(160);
  const withAction = resolveProductCardCatalogGridTotalHeight(160, undefined, {
    withAction: true,
  });
  assert.equal(Math.round((withAction - plain) * 10) / 10, 42.4);
});

test("кнопка только на главной: «В корзину», состояния и «Записаться»", () => {
  const home = read("app/(tabs)/index.tsx");
  assert.equal((home.match(/showPurchaseAction\n/g) ?? []).length, 2);
  assert.equal((home.match(/withActionButton\n/g) ?? []).length, 2);

  // Остальные списки (витрина, розыгрыш, похожие, сравнение) — без кнопки.
  for (const file of [
    "features/seller-products-page/ui/SellerProductsPage.tsx",
    "features/raffle-products-page/ui/RaffleProductsPage.tsx",
    "features/product-detail/ui/ProductSimilarTab.tsx",
    "features/product-detail/ui/ProductCompareTab.tsx",
  ]) {
    assert.doesNotMatch(read(file), /showPurchaseAction/, file);
  }

  const action = read("features/catalog-grid/ui/ProductCardPurchaseAction.tsx");
  assert.match(action, /variant=\{placement\}/);
  assert.match(action, /placement = "card"/);
  assert.match(action, /ADD_TO_CART_UI\.OWN_PRODUCT/);
  assert.match(action, /state\.showDealButton/);
  assert.match(action, /product\.productIsAvailable === false/);

  // Гость видит «В корзину», а не «Войти, чтобы купить».
  const cart = read("features/cart-add/ui/AddToCartButton.tsx");
  assert.match(cart, /if \(isCard\) \{[\s\S]*?ADD_TO_CART_UI\.ADD/);

  // В карточке ленты у заявки нет телефона — одна кнопка.
  const deal = read("entities/deal-request/ui/ProductDealActions.tsx");
  assert.match(deal, /const canShowPhone = !isCard &&/);
});

test("баннер в ленте: кнопка под текстом, по ширине надписи, только на главной", () => {
  const banner = read("entities/product/ui/ProductCardBanner.tsx");
  assert.match(banner, /renderPurchaseAction\(product, "banner"\)/);
  // Под «У нас закрыто» кнопки нет — карточка не кликается.
  assert.match(banner, /renderPurchaseAction && !showSellerClosedOverlay/);

  const row = read("features/catalog-grid/ui/CatalogGridRowItem.tsx");
  assert.match(
    row,
    /<ProductCardBanner[\s\S]*?showPurchaseAction \? renderProductCardPurchaseAction : undefined/,
  );

  const cart = read("features/cart-add/ui/AddToCartButton.tsx");
  assert.match(cart, /<ShoppingCart/);
  assert.match(cart, /isBanner && styles\.bannerStepper/);
  assert.match(read("shared/ui/BlockedPurchaseButton.tsx"), /variant === "banner"/);
  assert.match(
    read("entities/deal-request/ui/ProductDealActions.tsx"),
    /styles\.rootBanner/,
  );
});

test("подписи совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/catalog.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const key of ["OWN_PRODUCT", "ADD", "OUT_OF_STOCK"]) {
    const value = new RegExp(`\\n  ${key}: "([^"]+)"`).exec(web)?.[1];
    assert.ok(value, key);
    assert.ok(mobile.includes(`${key}: "${value}"`), key);
  }
});
