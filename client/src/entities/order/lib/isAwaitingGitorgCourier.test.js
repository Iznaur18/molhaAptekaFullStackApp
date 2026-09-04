import { describe, expect, it } from "vitest";

import { isAwaitingGitorgCourier } from "./isAwaitingGitorgCourier.js";

describe("isAwaitingGitorgCourier", () => {
  it("да: ready_to_ship + курьерская доставка без курьера", () => {
    expect(
      isAwaitingGitorgCourier({
        status: "ready_to_ship",
        shipment: { courierDelivery: true, courierId: null },
      }),
    ).toBe(true);
  });

  it("нет: курьер уже назначен", () => {
    expect(
      isAwaitingGitorgCourier({
        status: "ready_to_ship",
        shipment: { courierDelivery: true, courierId: "c1" },
      }),
    ).toBe(false);
  });

  it("нет: доставка продавцом", () => {
    expect(
      isAwaitingGitorgCourier({
        status: "ready_to_ship",
        shipment: { courierDelivery: false },
      }),
    ).toBe(false);
  });

  it("нет: ещё собирают", () => {
    expect(
      isAwaitingGitorgCourier({
        status: "assembling",
        shipment: { courierDelivery: true },
      }),
    ).toBe(false);
  });
});
