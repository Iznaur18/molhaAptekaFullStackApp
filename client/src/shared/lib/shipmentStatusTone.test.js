import { describe, expect, it } from "vitest";

import { resolveShipmentStatusTone } from "./shipmentStatusTone.js";

describe("resolveShipmentStatusTone", () => {
  it("доставлено — зелёный у всех служб", () => {
    expect(resolveShipmentStatusTone("done")).toBe("success"); // ЛОБО
    expect(resolveShipmentStatusTone("DELIVERED")).toBe("success"); // СДЭК
    expect(resolveShipmentStatusTone("POSTOMAT_RECEIVED")).toBe("success");
    expect(resolveShipmentStatusTone("delivered_finish")).toBe("success"); // Экспресс
  });

  it("отмена и сбой — красный, даже если код «доставляется»", () => {
    expect(resolveShipmentStatusTone("cancelled")).toBe("danger");
    expect(resolveShipmentStatusTone("NOT_DELIVERED")).toBe("danger");
    expect(resolveShipmentStatusTone("CANCELLED_BY_TAXI")).toBe("danger");
    expect(resolveShipmentStatusTone("IN_PROGRESS", { cancelled: true })).toBe(
      "danger",
    );
  });

  it("служба не вызвана — жёлтый: ждёт действия", () => {
    expect(resolveShipmentStatusTone("", { notStarted: true })).toBe("warning");
  });

  it("только создано — серый, в пути — синий", () => {
    expect(resolveShipmentStatusTone("CREATED")).toBe("neutral");
    expect(resolveShipmentStatusTone("")).toBe("neutral");
    expect(resolveShipmentStatusTone("in_progress")).toBe("info");
    expect(resolveShipmentStatusTone("RECEIVED_AT_SHIPMENT_WAREHOUSE")).toBe("info");
  });
});
