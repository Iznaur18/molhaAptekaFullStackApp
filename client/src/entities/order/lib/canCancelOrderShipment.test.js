import { MY_ORDER_UNKNOWN_SELLER_ID } from "@izibuy/shared-lib";
import { describe, expect, it } from "vitest";

import { canCancelOrderShipment } from "./canCancelOrderShipment.js";

const SELLER_ID = "68f0a1c2b3d4e5f60718293a";

describe("canCancelOrderShipment", () => {
  it("разрешает отмену, пока все позиции у продавца", () => {
    expect(
      canCancelOrderShipment({
        sellerId: SELLER_ID,
        items: [{ status: "pending" }, { status: "ready_to_ship" }],
      }),
    ).toBe(true);
  });

  it("не считает отменённые позиции препятствием", () => {
    expect(
      canCancelOrderShipment({
        sellerId: SELLER_ID,
        items: [{ status: "cancelled" }, { status: "accepted" }],
      }),
    ).toBe(true);
  });

  it("запрещает отмену, если хоть одна позиция уехала", () => {
    expect(
      canCancelOrderShipment({
        sellerId: SELLER_ID,
        items: [{ status: "pending" }, { status: "shipped" }],
      }),
    ).toBe(false);
  });

  it("на полностью отменённом заказе кнопки нет", () => {
    expect(
      canCancelOrderShipment({ sellerId: SELLER_ID, items: [{ status: "cancelled" }] }),
    ).toBe(false);
  });

  it("без продавца кнопки нет: сервер адресует отмену отправлением", () => {
    expect(
      canCancelOrderShipment({ sellerId: "", items: [{ status: "pending" }] }),
    ).toBe(false);
    expect(
      canCancelOrderShipment({
        sellerId: MY_ORDER_UNKNOWN_SELLER_ID,
        items: [{ status: "pending" }],
      }),
    ).toBe(false);
  });

  it("пустой список и мусор не ломают проверку", () => {
    expect(canCancelOrderShipment({ sellerId: SELLER_ID, items: [] })).toBe(false);
    expect(canCancelOrderShipment({ sellerId: SELLER_ID, items: null })).toBe(false);
    expect(canCancelOrderShipment({ sellerId: SELLER_ID, items: [{}] })).toBe(false);
  });
});
