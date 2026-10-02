import { describe, expect, it } from "vitest";

import { formatCartGroupDeliveryHint } from "./formatCartGroupDeliveryHint.js";

/** @param {unknown} deliveryTariff */
const sellerGroup = (deliveryTariff) => ({
  deliveryAvailable: true,
  deliveryCarrier: "seller",
  lines: [
    {
      product: {
        productSeller: { _id: "s1", sellerFulfillmentDefaults: { deliveryTariff } },
      },
    },
  ],
});

describe("доставка в строке продавца", () => {
  it("бесплатный тариф продавца", () => {
    expect(formatCartGroupDeliveryHint(sellerGroup(null), 500)).toBe(
      "Доставка бесплатно",
    );
  });

  it("платный тариф — «от» цены вызова", () => {
    expect(
      formatCartGroupDeliveryHint(sellerGroup({ paid: true, baseFeeRub: 150 }), 500),
    ).toMatch(/^Доставка от 150\s₽$/);
  });

  it("сумма дотянула до порога — бесплатно", () => {
    expect(
      formatCartGroupDeliveryHint(
        sellerGroup({ paid: true, baseFeeRub: 150, freeFromRub: 3000 }),
        3500,
      ),
    ).toBe("Доставка бесплатно");
  });

  it("курьеры Gitorg и ЛОБО", () => {
    expect(
      formatCartGroupDeliveryHint(
        { deliveryAvailable: true, deliveryCarrier: "gitorg_courier", lines: [] },
        0,
      ),
    ).toMatch(/^Курьеру от 100\s₽$/);
    expect(
      formatCartGroupDeliveryHint(
        { deliveryAvailable: true, deliveryCarrier: "lobo", lines: [] },
        0,
      ),
    ).toBe("Доставка ЛОБО, оплата курьеру");
  });

  it("без доставки или со смешанными службами — молчим", () => {
    expect(
      formatCartGroupDeliveryHint(
        { deliveryAvailable: false, deliveryCarrier: null },
        0,
      ),
    ).toBe("");
    expect(
      formatCartGroupDeliveryHint(
        { deliveryAvailable: true, deliveryCarrier: "mixed" },
        0,
      ),
    ).toBe("");
  });
});
