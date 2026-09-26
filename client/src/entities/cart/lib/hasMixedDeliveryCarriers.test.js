import { describe, expect, it } from "vitest";

import { hasMixedDeliveryCarriers } from "./hasMixedDeliveryCarriers.js";

describe("разные службы доставки у товаров", () => {
  it("своя доставка и ЛОБО — смешаны", () => {
    expect(
      hasMixedDeliveryCarriers([
        { productDeliveryCarrier: "seller" },
        { productDeliveryCarrier: "lobo" },
      ]),
    ).toBe(true);
  });

  it("старые флаги тоже считаются службой", () => {
    expect(
      hasMixedDeliveryCarriers([
        { productDeliveryEnabled: true },
        { productCourierDeliveryEnabled: true },
      ]),
    ).toBe(true);
  });

  it("одна служба — не смешаны", () => {
    expect(
      hasMixedDeliveryCarriers([
        { productDeliveryCarrier: "lobo" },
        { productDeliveryCarrier: "lobo" },
      ]),
    ).toBe(false);
  });

  it("товар только с самовывозом службу не добавляет", () => {
    expect(
      hasMixedDeliveryCarriers([
        { productDeliveryCarrier: "seller" },
        { productPickupEnabled: true },
      ]),
    ).toBe(false);
  });

  it("пусто — не смешаны", () => {
    expect(hasMixedDeliveryCarriers([])).toBe(false);
    expect(hasMixedDeliveryCarriers(null)).toBe(false);
  });
});
