import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  groupCartLinesBySeller,
  hasMixedDeliveryCarriers,
  quoteCartSellerDelivery,
  resolveCartFulfillmentBySeller,
  resolveCartSellerDelivery,
} from "@izibuy/shared-lib";

import { resolveCartGroupDeliveryHint } from "../entities/cart/lib/resolveCartGroupDeliveryHint.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const seller = (id, extra = {}) => ({ _id: id, userName: `seller-${id}`, ...extra });

/** Строка корзины с товаром продавца. */
const line = (productId, productSeller, product = {}) => ({
  productId,
  quantity: 1,
  product: {
    _id: productId,
    productSeller,
    productPickupEnabled: true,
    productDeliveryEnabled: true,
    ...product,
  },
});

const paidTariff = { paid: true, baseFeeRub: 150, perKmRub: 20, freeFromRub: 5000 };
const sellerWithTariff = seller("a", {
  sellerPaymentMethods: ["cardOnDelivery"],
  sellerFulfillmentDefaults: { deliveryTariff: paidTariff },
});

test("корзина делится по продавцам, а не по способу получения", () => {
  const groups = groupCartLinesBySeller([
    line("p1", seller("a")),
    line("p2", seller("b")),
    line("p3", seller("a")),
  ]);

  assert.deepEqual(
    groups.map((group) => [group.sellerId, group.lines.map((row) => row.productId)]),
    [
      ["a", ["p1", "p3"]],
      ["b", ["p2"]],
    ],
  );
  assert.equal(groups[0].sellerName, "seller-a");
});

test("способ доступен, только если его поддерживают все товары продавца", () => {
  const [group] = groupCartLinesBySeller([
    line("p1", seller("a")),
    line("p2", seller("a"), { productDeliveryEnabled: false }),
  ]);
  assert.equal(group.pickupAvailable, true);
  assert.equal(group.deliveryAvailable, false);
  assert.equal(group.defaultMethod, "pickup");

  const [deliveryOnly] = groupCartLinesBySeller([
    line("p1", seller("a"), { productPickupEnabled: false }),
  ]);
  assert.equal(deliveryOnly.defaultMethod, "delivery");
});

test("выбор покупателя уважается, пока он доступен", () => {
  const groups = groupCartLinesBySeller([
    line("p1", seller("a")),
    line("p2", seller("b"), { productDeliveryEnabled: false }),
  ]);
  assert.deepEqual(
    resolveCartFulfillmentBySeller(groups, { a: "delivery", b: "delivery" }),
    // У продавца b доставки нет — сохранённый выбор не должен уйти на сервер.
    { a: "delivery", b: "pickup" },
  );
});

test("разные службы у товаров одного продавца — предупреждение", () => {
  assert.equal(
    hasMixedDeliveryCarriers([
      { productDeliveryEnabled: true },
      { productCourierDeliveryEnabled: true },
    ]),
    true,
  );
  assert.equal(
    hasMixedDeliveryCarriers([
      { productDeliveryEnabled: true },
      { productPickupEnabled: true },
    ]),
    false,
  );
});

test("тариф продавца считается только при доставке продавцом", () => {
  const groups = groupCartLinesBySeller([line("p1", sellerWithTariff)]);

  assert.equal(
    resolveCartSellerDelivery({
      sellerGroups: groups,
      fulfillmentBySellerId: { a: "pickup" },
      goodsTotalRub: 1000,
    }),
    null,
  );

  const delivery = resolveCartSellerDelivery({
    sellerGroups: groups,
    fulfillmentBySellerId: { a: "delivery" },
    goodsTotalRub: 1000,
  });
  assert.equal(delivery?.sellerId, "a");
  assert.equal(delivery?.tariff.baseFeeRub, 150);

  // Пока расстояния нет — оценка «от», с расстоянием — точная сумма.
  const estimate = quoteCartSellerDelivery({ ...delivery, distanceKm: null });
  assert.equal(estimate?.isEstimate, true);
  assert.equal(estimate?.feeRub, 150);

  const exact = quoteCartSellerDelivery({ ...delivery, distanceKm: 4.2 });
  assert.equal(exact?.isEstimate, false);
  // Километры округляются вверх: 150 + 5 × 20.
  assert.equal(exact?.feeRub, 250);
  assert.equal(exact?.payableRub, 1250);

  const free = quoteCartSellerDelivery({
    tariff: delivery.tariff,
    goodsTotalRub: 6000,
    distanceKm: 4.2,
  });
  assert.equal(free?.isFree, true);
});

test("подсказка о доставке в строке продавца", () => {
  const [paid] = groupCartLinesBySeller([line("p1", sellerWithTariff)]);
  assert.deepEqual(resolveCartGroupDeliveryHint(paid, 1000), {
    kind: "from",
    baseFeeRub: 150,
  });
  assert.deepEqual(resolveCartGroupDeliveryHint(paid, 6000), { kind: "free" });

  const [noTariff] = groupCartLinesBySeller([line("p1", seller("b"))]);
  assert.deepEqual(resolveCartGroupDeliveryHint(noTariff, 1000), { kind: "free" });

  const [pickupOnly] = groupCartLinesBySeller([
    line("p1", seller("c"), { productDeliveryEnabled: false }),
  ]);
  assert.equal(resolveCartGroupDeliveryHint(pickupOnly, 1000), null);

  // Курьеров площадки приложение пока не оформляет — подсказки нет.
  const [courier] = groupCartLinesBySeller([
    line("p1", seller("d"), {
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: true,
    }),
  ]);
  assert.equal(resolveCartGroupDeliveryHint(courier, 1000), null);
});

test("экран корзины: список продавцов, оформление — внутри продавца", () => {
  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /groupCartLinesBySeller\(visibleLines\)/);
  assert.match(cart, /<CartSellerList entries=\{sellerEntries\}/);
  assert.match(cart, /CART_PAGE_UI\.BACK_TO_SELLERS/);
  // Способ получения уходит на сервер по продавцу.
  assert.match(cart, /fulfillmentBySellerId: \{/);
  assert.match(cart, /sellerDelivery=\{sellerDelivery\}/);
  // Старого деления на «Самовывоз» и «Доставку» больше нет.
  assert.doesNotMatch(cart, /groupCartLinesByFulfillment/);

  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /<CheckoutSellerDeliveryCost/);

  const cost = read("features/checkout/ui/CheckoutSellerDeliveryCost.tsx");
  // Расстояние считает сервер, сумму — функция контракта через shared-lib.
  assert.match(cost, /fetchSellerDeliveryQuote/);
  assert.match(cost, /quoteCartSellerDelivery/);
});

test("на узком экране кнопка продавца уходит под имя — порог как на web", () => {
  const webCss = read("../client/src/pages/cart/ui/CartSellerList.css");
  const webBreakpoint =
    /@media \(max-width: (\d+)px\)\s*\{\s*\.cart-seller-row__top/.exec(webCss)?.[1];
  assert.ok(webBreakpoint, "в CartSellerList.css нет узкой раскладки строки продавца");

  const styles = read("shared/theme/cartFulfillmentStyles.ts");
  assert.match(
    styles,
    new RegExp(`CART_SELLER_ROW_STACK_MAX_WIDTH = ${webBreakpoint};`),
  );

  const row = read("entities/cart/ui/CartSellerList.tsx");
  assert.match(row, /windowWidth <= CART_SELLER_ROW_STACK_MAX_WIDTH/);
  assert.match(row, /styles\.topStacked/);
  assert.match(row, /styles\.checkoutStacked/);
});
