import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readMobile = (p) => readFileSync(join(MOBILE_ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT_ROOT, "src", p), "utf8");

test("cart dock metrics: total gap 6, unitPrice 17, disabledOpacity 0.55, sticky shadow", () => {
  const catalog = readMobile("shared/theme/catalogProductStyles.ts");
  const commerce = readMobile("shared/theme/commerceScreenStyles.ts");
  const tokens = readFileSync(
    join(MOBILE_ROOT, "..", "packages/design-tokens/src/interaction.ts"),
    "utf8",
  );

  assert.match(catalog, /footerTotalBlock:[\s\S]*gap: 6/);
  assert.match(catalog, /stickyFooterShadow:[\s\S]*shadowOpacity: 0\.12/);
  assert.match(catalog, /stickyFooterShadow:[\s\S]*shadowRadius: 18/);
  assert.match(catalog, /stickyFooterShadow:[\s\S]*height: 10/);
  assert.match(catalog, /stickyFooterShadow:[\s\S]*elevation: 16/);
  assert.match(commerce, /unitPrice:[\s\S]*fontSize: 17/);
  assert.match(commerce, /unitPrice:[\s\S]*fontWeight: "700"/);
  assert.match(tokens, /disabledOpacity: 0\.55/);
  assert.match(
    commerce,
    /actionDisabled:[\s\S]*opacity: theme\.interaction\.disabledOpacity/,
  );
});

test("cart merges LuckyBox + FortuneWheel wins like web CartPage", () => {
  const cart = readMobile("app/(tabs)/cart.tsx");
  const webCart = readClient("pages/cart/ui/CartPage.jsx");
  const luckyMerge = readMobile(
    "entities/seller-lucky-box/lib/mergeLuckyBoxWinsIntoAppliedPromos.ts",
  );
  const wheelMerge = readMobile(
    "entities/seller-fortune-wheel/lib/mergeFortuneWheelWinsIntoAppliedPromos.ts",
  );

  assert.match(webCart, /mergeLuckyBoxWinsIntoAppliedPromos/);
  assert.match(webCart, /mergeFortuneWheelWinsIntoAppliedPromos/);
  assert.match(webCart, /prizeFreeUnitsByProductId/);
  assert.match(webCart, /prizeAutoAddedRef/);

  assert.match(cart, /mergeLuckyBoxWinsIntoAppliedPromos/);
  assert.match(cart, /mergeFortuneWheelWinsIntoAppliedPromos/);
  assert.match(cart, /useMyLuckyBoxWinsQuery/);
  assert.match(cart, /useMyFortuneWheelWinsQuery/);
  assert.match(cart, /prizeFreeUnitsByProductId/);
  assert.match(cart, /prizeAutoAddedRef/);
  assert.match(cart, /addItem\(productId, 1\)/);
  assert.match(cart, /appliedPromosWithGameWins/);

  assert.match(luckyMerge, /LUCKY_BOX_ORDER_PROMO_CODE/);
  assert.match(luckyMerge, /prizeProductId/);
  assert.match(wheelMerge, /FORTUNE_WHEEL_ORDER_PROMO_CODE/);
  assert.match(wheelMerge, /prizeProductId/);
});

test("cart line prize badge/hint + game promo labels parity", () => {
  const copy = readMobile("shared/config/appUiCopy.ts");
  const line = readMobile("entities/cart/ui/CartLineItem.tsx");
  const webCopy = readClient("shared/config/copy/cart-checkout.js");
  const webLine = readClient("pages/cart/ui/CartLineItem.jsx");

  assert.match(webCopy, /PRIZE_LINE_BADGE: "🎁 Приз"/);
  assert.match(webCopy, /PRIZE_LINE_HINT:/);
  assert.match(copy, /PRIZE_LINE_BADGE: "🎁 Приз"/);
  assert.match(copy, /PRIZE_LINE_HINT:/);
  assert.match(copy, /CART_LINE_LABEL: "Коробки удачи"/);
  assert.match(copy, /CART_LINE_LABEL: "Колесо фортуны"/);

  assert.match(webLine, /PRIZE_LINE_BADGE/);
  assert.match(webLine, /PRIZE_LINE_HINT/);
  assert.match(webLine, /LUCKY_BOX_ORDER_PROMO_CODE/);
  assert.match(webLine, /FORTUNE_WHEEL_ORDER_PROMO_CODE/);
  assert.match(line, /PRIZE_LINE_BADGE/);
  assert.match(line, /PRIZE_LINE_HINT/);
  assert.match(line, /LUCKY_BOX_ORDER_PROMO_CODE/);
  assert.match(line, /FORTUNE_WHEEL_ORDER_PROMO_CODE/);
  assert.match(line, /prizeFreeUnits/);
});

test("selectCartLines accepts prizeFreeUnitsByProductId", () => {
  const mobile = readMobile("entities/cart/lib/selectCartLines.ts");
  const web = readClient("entities/cart/lib/selectCartLines.js");

  assert.match(mobile, /prizeFreeUnitsByProductId/);
  assert.match(mobile, /prizeFreeUnits:/);
  assert.match(web, /prizeFreeUnitsByProductId/);
  assert.match(web, /prizeFreeUnits/);
});

test("checkout form field chrome: gap 14 / input 9·14 / radio 44", () => {
  const form = readMobile("shared/theme/formChromeStyles.ts");
  const webCss = readClient("shared/ui/CheckoutForm/CheckoutForm.css");

  assert.match(form, /fields:[\s\S]*gap: 14/);
  assert.match(form, /input:[\s\S]*paddingVertical: 9/);
  assert.match(form, /input:[\s\S]*paddingHorizontal: 14/);
  assert.match(form, /radioRow:[\s\S]*minHeight: 44/);
  assert.match(webCss, /gap:\s*0\.875rem|gap:\s*14px/);
});
