import { describe, expect, it } from "vitest";

import {
  resolveNextShipmentStatus,
  resolveShipmentAdvanceAction,
} from "./resolveNextShipmentStatus.js";

describe("следующая ступень отправления", () => {
  it("самовывоз ведёт к «Готов к выдаче»", () => {
    expect(resolveNextShipmentStatus("pending", "pickup")).toBe("accepted");
    expect(resolveNextShipmentStatus("accepted", "pickup")).toBe("assembling");
    expect(resolveNextShipmentStatus("assembling", "pickup")).toBe("ready_for_pickup");
  });

  it("доставка ведёт к «Готов к отгрузке»", () => {
    expect(resolveNextShipmentStatus("assembling", "delivery")).toBe("ready_to_ship");
  });

  it("после «Готов» и после отгрузки двигать нечего", () => {
    expect(resolveNextShipmentStatus("ready_for_pickup", "pickup")).toBeNull();
    expect(resolveNextShipmentStatus("ready_to_ship", "delivery")).toBeNull();
    expect(resolveNextShipmentStatus("shipped", "delivery")).toBeNull();
    expect(resolveNextShipmentStatus("cancelled", "pickup")).toBeNull();
  });
});

describe("кнопка перехода", () => {
  it("подписывается по следующей ступени", () => {
    expect(resolveShipmentAdvanceAction("pending", "pickup")).toEqual({
      nextStatus: "accepted",
      label: "Принять",
    });
    expect(resolveShipmentAdvanceAction("assembling", "delivery")).toEqual({
      nextStatus: "ready_to_ship",
      label: "Готов к отгрузке",
    });
  });

  it("на самовывозе и доставке подпись последней ступени разная", () => {
    expect(resolveShipmentAdvanceAction("assembling", "pickup").label).toBe(
      "Готов к выдаче",
    );
    expect(resolveShipmentAdvanceAction("assembling", "delivery").label).toBe(
      "Готов к отгрузке",
    );
  });

  it("кнопки нет, когда ступени кончились", () => {
    expect(resolveShipmentAdvanceAction("ready_for_pickup", "pickup")).toBeNull();
    expect(resolveShipmentAdvanceAction("delivered", "delivery")).toBeNull();
  });
});
