import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canCancelOrderItem,
  canCancelOrderShipment,
  canMarkOrderItemReturned,
  isOrderShipmentTrackedByCarrier,
} from "../dist/index.js";

const items = (...statuses) => statuses.map((status) => ({ status }));

describe("отмена и возврат в карточке заказа", () => {
  it("позицию отменяют, пока товар у продавца", () => {
    for (const status of [
      "pending",
      "accepted",
      "assembling",
      "ready_for_pickup",
      "ready_to_ship",
    ]) {
      assert.equal(canCancelOrderItem(status), true, status);
    }
    for (const status of [
      "shipped",
      "delivered",
      "confirmed",
      "cancelled",
      "returned",
    ]) {
      assert.equal(canCancelOrderItem(status), false, status);
    }
    assert.equal(canCancelOrderItem(undefined), false);
  });

  it("заказ целиком — только если все живые позиции у продавца", () => {
    assert.equal(
      canCancelOrderShipment({ sellerId: "s1", items: items("accepted", "cancelled") }),
      true,
    );
    assert.equal(
      canCancelOrderShipment({ sellerId: "s1", items: items("accepted", "shipped") }),
      false,
    );
    assert.equal(
      canCancelOrderShipment({ sellerId: "s1", items: items("cancelled") }),
      false,
    );
    // Legacy-заказ без продавца: сервер такое отправление не найдёт.
    assert.equal(
      canCancelOrderShipment({ sellerId: "", items: items("pending") }),
      false,
    );
    assert.equal(
      canCancelOrderShipment({ sellerId: "__unknown__", items: items("pending") }),
      false,
    );
  });

  it("возврат — после отгрузки и до подтверждения, если не ведёт служба", () => {
    assert.equal(
      canMarkOrderItemReturned({ status: "shipped", carrierTracksShipment: false }),
      true,
    );
    assert.equal(
      canMarkOrderItemReturned({ status: "delivered", carrierTracksShipment: false }),
      true,
    );
    assert.equal(
      canMarkOrderItemReturned({ status: "delivered", carrierTracksShipment: true }),
      false,
    );
    assert.equal(
      canMarkOrderItemReturned({ status: "confirmed", carrierTracksShipment: false }),
      false,
    );
  });

  it("служба ведёт только доставку СДЭК и Яндексом", () => {
    assert.equal(
      isOrderShipmentTrackedByCarrier({
        fulfillment: "delivery",
        deliveryCarrier: "cdek",
      }),
      true,
    );
    assert.equal(
      isOrderShipmentTrackedByCarrier({
        fulfillment: "delivery",
        deliveryCarrier: "yandex_express",
      }),
      true,
    );
    assert.equal(
      isOrderShipmentTrackedByCarrier({
        fulfillment: "pickup",
        deliveryCarrier: "cdek",
      }),
      false,
    );
    assert.equal(
      isOrderShipmentTrackedByCarrier({
        fulfillment: "delivery",
        deliveryCarrier: "seller",
      }),
      false,
    );
  });
});
