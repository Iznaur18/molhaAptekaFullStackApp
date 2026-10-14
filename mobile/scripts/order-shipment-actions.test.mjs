import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { resolveCheckoutSellers } from "../entities/cart/lib/resolveCheckoutSellers.ts";
import { resolveOrderShipmentActions } from "../entities/order/lib/resolveOrderShipmentActions.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const SELLER_ID = "64b000000000000000000001";

/** Заказ одного продавца: способ получения и статусы позиций. */
const order = ({ method = "pickup", statuses = ["pending"], ...rest } = {}) => ({
  fulfillmentMethod: method,
  paymentMethod: "cashOnDelivery",
  totalAmount: 1000,
  items: statuses.map((status, itemIndex) => ({
    status,
    itemIndex,
    sellerIdAtOrder: SELLER_ID,
  })),
  shipments: [{ sellerId: SELLER_ID, fulfillmentMethod: method }],
  ...rest,
});

test("самовывоз: продавец идёт по ступеням и выдаёт из «Готов к выдаче»", () => {
  const pending = resolveOrderShipmentActions(order(), "seller");
  assert.deepEqual(pending.advance, { nextStatus: "accepted", label: "Принять" });
  // Сервер отклоняет «Отгрузить» для самовывоза — кнопки быть не должно.
  assert.deepEqual(pending.shipItemIndexes, []);
  assert.deepEqual(pending.handOverItemIndexes, []);

  const assembling = resolveOrderShipmentActions(
    order({ statuses: ["assembling"] }),
    "seller",
  );
  assert.equal(assembling.advance?.nextStatus, "ready_for_pickup");

  const ready = resolveOrderShipmentActions(
    order({ statuses: ["ready_for_pickup", "ready_for_pickup"] }),
    "seller",
  );
  assert.equal(ready.advance, null);
  assert.deepEqual(ready.handOverItemIndexes, [0, 1]);
  assert.deepEqual(ready.deliverItemIndexes, []);
});

test("доставка продавцом: отгрузка из «Готов к отгрузке», доставка из «Отгружен»", () => {
  const assembling = resolveOrderShipmentActions(
    order({ method: "delivery", statuses: ["assembling"] }),
    "seller",
  );
  assert.equal(assembling.advance?.nextStatus, "ready_to_ship");

  const ready = resolveOrderShipmentActions(
    order({ method: "delivery", statuses: ["ready_to_ship"] }),
    "seller",
  );
  assert.deepEqual(ready.shipItemIndexes, [0]);
  assert.deepEqual(ready.handOverItemIndexes, []);

  const shipped = resolveOrderShipmentActions(
    order({ method: "delivery", statuses: ["shipped"] }),
    "seller",
  );
  assert.deepEqual(shipped.deliverItemIndexes, [0]);
});

test("служба доставки и курьер площадки двигают отправление сами", () => {
  for (const shipment of [
    { deliveryCarrier: "cdek" },
    { deliveryCarrier: "lobo" },
    { courierDelivery: true },
  ]) {
    const actions = resolveOrderShipmentActions(
      order({
        method: "delivery",
        statuses: ["ready_to_ship"],
        shipments: [
          { sellerId: SELLER_ID, fulfillmentMethod: "delivery", ...shipment },
        ],
      }),
      "seller",
    );
    assert.deepEqual(actions.shipItemIndexes, [], JSON.stringify(shipment));
    assert.deepEqual(actions.deliverItemIndexes, [], JSON.stringify(shipment));
  }
});

test("предоплата: сначала продавец подтверждает, потом покупатель платит", () => {
  const prepaid = { paymentMethod: "cardPrepaid", prepaidPaidAt: null };

  const beforeAccept = resolveOrderShipmentActions(order(prepaid), "buyer");
  assert.equal(beforeAccept.awaitingSellerAccept, true);
  assert.equal(beforeAccept.awaitingPaymentAfterAccept, false);

  // Подтвердить заказ продавец может и до оплаты — это его «товар есть».
  const sellerBeforeAccept = resolveOrderShipmentActions(order(prepaid), "seller");
  assert.equal(sellerBeforeAccept.advance?.nextStatus, "accepted");

  const afterAccept = {
    ...prepaid,
    statuses: ["accepted"],
    prepaymentDueAt: "2026-10-13T12:30:00.000Z",
  };
  const buyer = resolveOrderShipmentActions(order(afterAccept), "buyer");
  assert.equal(buyer.awaitingPaymentAfterAccept, true);
  assert.equal(buyer.prepaymentDueAt, "2026-10-13T12:30:00.000Z");
  assert.equal(buyer.prepaymentAmountRub, 1000);

  // Собирать неоплаченный заказ сервер не даст — кнопки быть не должно.
  const seller = resolveOrderShipmentActions(order(afterAccept), "seller");
  assert.equal(seller.advance, null);

  const paid = resolveOrderShipmentActions(
    order({ ...afterAccept, prepaidPaidAt: "2026-10-12T12:40:00.000Z" }),
    "seller",
  );
  assert.equal(paid.awaitingPrepayment, false);
  assert.equal(paid.advance?.nextStatus, "assembling");
});

test("в сумму предоплаты входит доставка по тарифу продавца", () => {
  const actions = resolveOrderShipmentActions(
    order({
      method: "delivery",
      paymentMethod: "cardPrepaid",
      statuses: ["accepted"],
      shipments: [
        {
          sellerId: SELLER_ID,
          fulfillmentMethod: "delivery",
          sellerDeliveryFeeRub: 250,
        },
      ],
    }),
    "buyer",
  );
  assert.equal(actions.prepaymentAmountRub, 1250);
});

test("покупателю кнопки продавца не считаются", () => {
  const actions = resolveOrderShipmentActions(
    order({ statuses: ["ready_for_pickup"] }),
    "buyer",
  );
  assert.equal(actions.advance, null);
  assert.deepEqual(actions.handOverItemIndexes, []);
});

test("продавцы оформления и их способы оплаты берутся из productSeller", () => {
  assert.deepEqual(
    resolveCheckoutSellers([
      { productSeller: { _id: "a", sellerPaymentMethods: ["cardOnDelivery"] } },
      { productSeller: { _id: "a" } },
      { productSeller: "b" },
      { productSeller: null },
      null,
    ]),
    [
      { sellerId: "a", sellerPaymentMethods: ["cardOnDelivery"] },
      { sellerId: "b", sellerPaymentMethods: [] },
    ],
  );
});

test("экраны подключают оплату и ступени, а не старые кнопки у позиции", () => {
  const card = read("entities/order/ui/OrderCard.tsx");
  assert.match(card, /resolveOrderShipmentActions\(order, attentionRole\)/);
  assert.match(card, /ORDER_CARD_UI\.PAY_NOW_AMOUNT/);
  assert.match(card, /ORDER_CARD_UI\.ACTION_HANDED_TO_BUYER/);

  const sales = read("features/my-sales-page/ui/MySalesPage.tsx");
  assert.match(sales, /onAdvanceShipment=\{handleAdvanceShipment\}/);

  const orders = read("features/my-orders-page/ui/MyOrdersPage.tsx");
  assert.match(orders, /onPayOrder=\{handlePayOrder\}/);
  // Сервер принимает только путь сайта, не схему приложения.
  assert.match(orders, /MY_ORDERS_WEB_PATH = "\/my-orders"/);
  // Возврат из браузера банка обновляет заказы.
  assert.match(orders, /AppState\.addEventListener\("change"/);

  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /allowedPaymentMethods=\{allowedPaymentMethods\}/);
  assert.match(cart, /cardPrepaidAvailable=\{cardPrepaidAvailable\}/);
});
