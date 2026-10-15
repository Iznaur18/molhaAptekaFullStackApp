import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { resolveOrderShipmentActions } from "../entities/order/lib/resolveOrderShipmentActions.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const SELLER_ID = "64b000000000000000000001";

const order = ({ method = "pickup", statuses = ["pending"], carrier } = {}) => ({
  fulfillmentMethod: method,
  paymentMethod: "cashOnDelivery",
  totalAmount: 1000,
  items: statuses.map((status, itemIndex) => ({
    status,
    itemIndex,
    sellerIdAtOrder: SELLER_ID,
  })),
  shipments: [
    {
      sellerId: SELLER_ID,
      fulfillmentMethod: method,
      ...(carrier ? { deliveryCarrier: carrier } : {}),
    },
  ],
});

test("«Отменить заказ»: пока все живые позиции у продавца, на любой ступени сборки", () => {
  for (const statuses of [
    ["pending"],
    ["accepted", "assembling"],
    ["ready_for_pickup", "cancelled"],
  ]) {
    const actions = resolveOrderShipmentActions(order({ statuses }), "buyer");
    assert.equal(actions.canCancelOrder, true, statuses.join(","));
    assert.equal(actions.sellerId, SELLER_ID);
  }
  // Одна позиция уехала — заказ целиком уже не отменить, только возврат.
  assert.equal(
    resolveOrderShipmentActions(order({ statuses: ["accepted", "shipped"] }), "seller")
      .canCancelOrder,
    false,
  );
  // Всё уже отменено — снимать нечего.
  assert.equal(
    resolveOrderShipmentActions(order({ statuses: ["cancelled"] }), "buyer")
      .canCancelOrder,
    false,
  );
});

test("отменённый заказ с предоплатой не просит оплатить", () => {
  const cancelled = resolveOrderShipmentActions(
    { ...order({ statuses: ["cancelled"] }), paymentMethod: "cardPrepaid" },
    "buyer",
  );
  assert.equal(cancelled.awaitingPrepayment, false);
  assert.equal(cancelled.awaitingPaymentAfterAccept, false);
  // Живой заказ после подтверждения продавцом по-прежнему ждёт оплаты.
  const accepted = resolveOrderShipmentActions(
    { ...order({ statuses: ["accepted"] }), paymentMethod: "cardPrepaid" },
    "buyer",
  );
  assert.equal(accepted.awaitingPaymentAfterAccept, true);
});

test("возврат отмечает служба, если отправление ведут СДЭК или Яндекс", () => {
  for (const carrier of ["cdek", "yandex_delivery", "yandex_express"]) {
    const actions = resolveOrderShipmentActions(
      order({ method: "delivery", statuses: ["shipped"], carrier }),
      "buyer",
    );
    assert.equal(actions.carrierTracksShipment, true, carrier);
  }
  assert.equal(
    resolveOrderShipmentActions(
      order({ method: "delivery", statuses: ["shipped"] }),
      "buyer",
    ).carrierTracksShipment,
    false,
  );
});

test("карточка: отмена до отгрузки, возврат после, «Отменить заказ» в строке отправления", () => {
  const card = read("entities/order/ui/OrderCard.tsx");
  assert.match(card, /canCancelOrderItem\(source\.status\)/);
  assert.doesNotMatch(
    card,
    /source\.status === ORDER_STATUS_PENDING && Boolean\(onCancelItem\)/,
  );
  assert.match(card, /canMarkOrderItemReturned\(\{/);
  assert.match(card, /carrierTracksShipment: shipment\.carrierTracksShipment/);
  assert.match(card, /ORDER_CARD_UI\.ACTION_RETURN\s*:\s*ORDER_CARD_UI\.ACTION_REFUSE/);
  assert.match(
    card,
    /onCancelOrder\?\.\(\{ orderId: order\._id, sellerId: shipment\.sellerId \}\)/,
  );
  assert.match(card, /ORDER_CARD_UI\.ACTION_CANCEL_ORDER/);
  assert.match(card, /ORDER_CARD_UI\.ITEM_RETURNED_BY_BUYER/);
});

test("покупатель и продавец: подтверждение текстами сайта", () => {
  const buyer = read("features/my-orders-page/ui/MyOrdersPage.tsx");
  assert.match(buyer, /ORDER_CARD_UI\.ITEM_CANCEL_CONFIRM/);
  assert.match(buyer, /ORDER_CARD_UI\.ACTION_REFUSE_CONFIRM/);
  assert.match(buyer, /ORDER_CARD_UI\.BUYER_CANCEL_CONFIRM/);
  assert.match(buyer, /onMarkReturned=\{handleMarkReturned\}/);
  assert.match(buyer, /onCancelOrder=\{handleCancelOrder\}/);

  const seller = read("features/my-sales-page/ui/MySalesPage.tsx");
  assert.match(seller, /ORDER_CARD_UI\.ITEM_CANCEL_CONFIRM/);
  assert.match(seller, /ORDER_CARD_UI\.ACTION_RETURN_CONFIRM/);
  assert.match(seller, /ORDER_CARD_UI\.CANCEL_CONFIRM/);
  assert.match(seller, /onMarkReturned=\{handleMarkReturned\}/);
  assert.match(seller, /onCancelOrder=\{handleCancelOrder\}/);
});

test("тексты отмены и возврата совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/orders.js");
  const mobile = read("shared/config/appUiCopy.ts");
  // Только блок ORDER_CARD_UI и точное имя ключа: CANCEL_CONFIRM не должен
  // совпасть с BUYER_CANCEL_CONFIRM, а ACTION_CANCEL — с одноимённым в других блоках.
  const pick = (source, key) => {
    const block = /ORDER_CARD_UI = \{[\s\S]*?\n\}/.exec(source)?.[0] ?? "";
    const match = new RegExp(`(?<![A-Z_])${key}:\\s*"([^"]+)"`).exec(block);
    return match?.[1] ?? null;
  };
  for (const key of [
    "ACTION_CANCEL_ORDER",
    "ACTION_RETURN",
    "ACTION_RETURN_CONFIRM",
    "ACTION_REFUSE",
    "ACTION_REFUSE_CONFIRM",
    "ITEM_CANCEL_CONFIRM",
    "ITEM_RETURNED_AT_LABEL",
    "ITEM_RETURNED_BY_BUYER",
    "ITEM_RETURNED_BY_SELLER",
    "BUYER_CANCEL_CONFIRM",
    "CANCEL_CONFIRM",
  ]) {
    const webValue = pick(web, key);
    assert.ok(webValue, `на сайте нет ${key}`);
    assert.equal(pick(mobile, key), webValue, key);
  }
});
