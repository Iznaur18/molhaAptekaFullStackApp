import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const read = (root, rel) => readFileSync(join(root, rel), "utf8");

test("cart page guest/empty copy matches web cart-checkout", () => {
  const mobileCopy = read(MOBILE_ROOT, "shared/config/appUiCopy.ts");
  const webCopy = read(CLIENT_ROOT, "src/shared/config/copy/cart-checkout.js");
  const cartScreen = read(MOBILE_ROOT, "app/(tabs)/cart.tsx");

  assert.match(webCopy, /AUTH_REQUIRED: "Войдите, чтобы оформить заказ\."/);
  assert.match(webCopy, /EMPTY: "Корзина пуста\."/);
  assert.match(webCopy, /AUTH_LOGIN: "Войти"/);
  assert.match(mobileCopy, /AUTH_REQUIRED: "Войдите, чтобы оформить заказ\."/);
  assert.match(mobileCopy, /EMPTY: "Корзина пуста\."/);
  assert.match(mobileCopy, /AUTH_LOGIN: "Войти"/);
  assert.match(cartScreen, /CART_PAGE_UI\.AUTH_REQUIRED/);
  assert.match(cartScreen, /CART_PAGE_UI\.AUTH_LOGIN/);
  assert.doesNotMatch(cartScreen, /AUTH_UI\.LOGIN_BUTTON/);
});

test("cart seller fulfillment dock matches web cart-fulfillment pad/radius", () => {
  const mobileStyles = read(MOBILE_ROOT, "shared/theme/cartFulfillmentStyles.ts");
  const webCss = read(
    CLIENT_ROOT,
    "src/features/checkout/ui/CheckoutFulfillmentCards.css",
  );

  assert.match(
    mobileStyles,
    /dock:[\s\S]*marginHorizontal: 12[\s\S]*marginTop: 6[\s\S]*paddingVertical: 14[\s\S]*paddingHorizontal: 16[\s\S]*borderRadius: 16/,
  );
  assert.match(mobileStyles, /dock:[\s\S]*gap: 10/);
  assert.match(mobileStyles, /checkoutFormFields:[\s\S]*gap: 6/);
  assert.match(mobileStyles, /backText:[\s\S]*fontSize: 14\.4/);
  assert.match(webCss, /--cart-fulfillment-card-gap: 6px/);
  assert.match(webCss, /\.cart-fulfillment__dock \{[\s\S]*gap: 10px/);
  assert.match(webCss, /\.cart-fulfillment__dock \{[\s\S]*padding: 14px 16px/);
  assert.match(webCss, /\.cart-fulfillment__dock \{[\s\S]*border-radius: 16px/);
});
