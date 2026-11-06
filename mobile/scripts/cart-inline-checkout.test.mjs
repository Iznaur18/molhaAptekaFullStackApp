import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("корзина продавца оформляется на странице, без шторки (паритет web)", () => {
  const cart = read("app/(tabs)/cart.tsx");
  // Форма стоит внутри секции продавца, итог с «Оформить» рисует CartCheckoutDock.
  assert.match(
    cart,
    /<CartFulfillmentSection[\s\S]*?<CheckoutForm[\s\S]*?<\/CartFulfillmentSection>/,
  );
  assert.match(cart, /renderFooter=\{\(footer\) => \(\s*<CartCheckoutDock/);
  assert.match(cart, /onSubmit=\{footer\.submit\}/);
  assert.match(cart, /deliveryCost=\{footer\.deliveryCost\}/);
  // Шторка осталась только у выигранного аукциона.
  assert.equal((cart.match(/<CheckoutSheetModal/g) ?? []).length, 1);
  assert.match(cart, /<CheckoutSheetModal\s+visible=\{auctionCheckoutBid != null\}/);
  assert.doesNotMatch(cart, /isSellerCheckoutOpen|openSellerCheckout/);
  // Поле адреса не прячется под клавиатурой, тап по кнопке не теряется.
  assert.match(cart, /keyboardShouldPersistTaps="handled"/);
  assert.match(cart, /automaticallyAdjustKeyboardInsets/);
});

test("итог корзины: цена доставки продавцом вместо «К оплате», ошибка над кнопкой", () => {
  const section = read("entities/cart/ui/CartFulfillmentSection.tsx");
  assert.match(section, /export const CartCheckoutDock/);
  // Цена доставки продавцом встаёт на место «К оплате»; у товаров за баллы
  // рублёвой строки нет вовсе — сумма в баллах идёт отдельной строкой.
  assert.match(
    section,
    /\{deliveryCost \?\?\s*\(pointsTotal != null \? null : \(\s*<View style=\{styles\.totalRow\}>\s*<Text style=\{styles\.payableLabel\}>\{CART_PAGE_UI\.PAYABLE_LABEL\}/,
  );
  assert.match(section, /CART_PAGE_UI\.POINTS_PAYABLE_LABEL/);
  assert.match(section, /CART_PAGE_UI\.CHECKOUT_SELLER/);
  assert.match(section, /CHECKOUT_FORM_UI\.SUBMIT_LOADING/);
  // Порядок в доке: причина блокировки и ошибка — над кнопкой.
  const errorAt = section.indexOf("{error ? (");
  const buttonAt = section.indexOf("<AppButton");
  assert.ok(errorAt > 0 && errorAt < buttonAt);
});

test("форма в корзине отдаёт кнопку и цену доставки наружу, в шторке — как раньше", () => {
  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /renderFooter\?: \(footer: CheckoutFormFooter\) => ReactNode/);
  assert.match(form, /deliveryCost: renderSellerDeliveryCost\(true\)/);
  // Без renderFooter форма сама рисует цену, сообщения и кнопку.
  assert.match(form, /\{renderFooter \? null : renderSellerDeliveryCost\(false\)\}/);
  assert.match(form, /!renderFooter && displayError/);

  const cost = read("features/checkout/ui/CheckoutSellerDeliveryCost.tsx");
  // В итоге без строки-заголовка и подписи про карты — как web в доке.
  assert.match(cost, /\{inDock \? null : \(/);
  assert.match(cost, /!inDock && !isFree && billableKm != null/);
});

test("подпись кнопки корзины совпадает с сайтом", () => {
  const web = read("../client/src/shared/config/copy/cart-checkout.js");
  const mobile = read("shared/config/appUiCopy.ts");
  const pick = (source) => /CHECKOUT_SELLER: "([^"]+)"/.exec(source)?.[1];
  assert.ok(pick(web));
  assert.equal(pick(mobile), pick(web));
});
