import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { resolveAuctionUiState } from "../entities/product/lib/resolveAuctionUiState.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const auctionProduct = (productDealType) => ({
  productAuctionEnabled: true,
  productModerationStatus: "approved",
  productIsAvailable: true,
  ...(productDealType ? { productDealType } : {}),
});

test("аукцион только у товаров с корзиной — как на сайте", () => {
  // Старые товары без поля — обычные товары.
  assert.equal(resolveAuctionUiState(auctionProduct()).auctionActive, true);
  assert.equal(resolveAuctionUiState(auctionProduct("goods")).auctionActive, true);
  for (const dealType of ["viewing", "service"]) {
    const ui = resolveAuctionUiState({
      ...auctionProduct(dealType),
      auctionActive: true,
    });
    assert.equal(ui.auctionActive, false, dealType);
    assert.equal(ui.enabled, false, dealType);
    assert.equal(ui.showSellerAuctionTab, false, dealType);
  }
});

test("осмотр и услуга: без «В корзину», «Нет в наличии» и «У нас закрыто»", () => {
  const screen = read("app/product/[id].tsx");
  assert.match(screen, /const viaCart = isProductPurchasableViaCart\(productRecord\);/);
  assert.match(screen, /const canShowAddToCart =\s*viaCart &&/);
  assert.match(screen, /const showOutOfStockPurchaseButton = viaCart &&/);
  assert.match(screen, /const showSellerClosedPurchaseButton =\s*viaCart &&/);
});

test("вместо «В корзину» — заявка и телефон, как на сайте", () => {
  const actions = read("entities/deal-request/ui/ProductDealActions.tsx");
  // Не для своего объявления и не для обычного товара.
  assert.ok(
    actions.includes("if (isCartDealType(dealType) || isOwnProduct || !productId)"),
  );
  assert.ok(actions.includes("isSellerPhoneOpenBeforeRequest(dealType)"));
  assert.match(actions, /<DealRequestSheet/);

  const screen = read("app/product/[id].tsx");
  // В узкой раскладке — в нижней панели на месте «В корзину».
  assert.match(screen, /const showMobileDealDock =/);
  assert.match(
    screen,
    /<ProductDealActions\s+product=\{productRecord\}[^>]*variant="dock"/,
  );

  const tab = read("features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  // В широкой — под ценой; плашки «только на сайте» больше нет.
  assert.match(tab, /showInlinePurchaseActions \? \(\s*<ProductDealActions/);
  assert.doesNotMatch(tab, /ProductDealOnWebNotice/);
});

test("панель адреса: место встречи у осмотра и услуги, свои подписи ЛОБО и курьеров", () => {
  const panel = read("features/product-detail/ui/ProductPickupDetailsPanel.tsx");
  // Без корзины доставки нет, адрес — место встречи.
  assert.match(
    panel,
    /const deliveryOn = isCartDeal && productShipsToBuyer\(product\);/,
  );
  assert.match(panel, /PRODUCT_PICKUP_UI\.DEAL_DETAILS_TITLE\[dealType\]/);
  assert.match(panel, /PRODUCT_PICKUP_UI\.DEAL_DETAILS_NO_ADDRESS\[dealType\]/);
  assert.match(
    panel,
    /normalizeProductServiceLocations\(product\.productServiceLocations\)/,
  );
  assert.match(panel, /PRODUCT_PICKUP_UI\.DETAILS_LOBO_HINT/);
  assert.match(panel, /PRODUCT_PICKUP_UI\.FULFILLMENT_COURIER/);

  const web = read("../client/src/shared/config/copy/cart-checkout.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const text of [
    "Место осмотра",
    "Адрес исполнителя не указан",
    "Исполнитель приедет к вам",
    "Курьер до двери по Чеченской Республике",
  ]) {
    // Текст есть на сайте и дословно в приложении.
    assert.ok(web.includes(text), `на сайте нет: ${text}`);
    assert.ok(mobile.includes(text), text);
  }
});

test("вкладка по умолчанию — описание, иначе характеристики, иначе возврат (как на сайте)", () => {
  const tab = read("features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  assert.match(
    tab,
    /const defaultContentTab: ContentTabId = hasDescription\s*\?\s*"description"\s*:\s*hasCharacteristics\s*\?\s*"characteristics"\s*:\s*"returns";/,
  );
});

test("вкладка «Получение» у осмотра и услуги — «Осмотр» и «Адрес», как на сайте", () => {
  const tab = read("features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  assert.match(tab, /PRODUCT_DETAILS_MODAL_UI\.DEAL_TAB_TITLE\[dealType\]/);

  const web = read("../client/src/shared/config/copy/product-detail.js");
  const mobile = read("shared/config/appUiCopy.ts");
  const pick = (source) =>
    /DEAL_TAB_TITLE: \{ viewing: "([^"]+)", service: "([^"]+)" \}/.exec(source);
  assert.ok(pick(web), "на сайте нет DEAL_TAB_TITLE");
  assert.deepEqual(pick(mobile)?.slice(1), pick(web).slice(1));
});
