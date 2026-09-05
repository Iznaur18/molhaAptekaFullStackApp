import { describe, expect, it } from "vitest";

import { quoteCartSellerDelivery } from "./quoteCartSellerDelivery.js";

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 55, freeFromRub: 0 };

describe("quoteCartSellerDelivery", () => {
  it("без адреса — оценка и товары + fee", () => {
    const quote = quoteCartSellerDelivery({
      tariff: TARIFF,
      origin: { lat: 43.3, lon: 45.7 },
      deliveryGeo: null,
      goodsTotalRub: 120_000,
    });

    expect(quote?.isEstimate).toBe(true);
    expect(quote?.payableRub).toBe(120_000 + quote.feeRub);
  });

  it("бесплатный тариф — null", () => {
    expect(
      quoteCartSellerDelivery({
        tariff: { paid: false },
        goodsTotalRub: 1000,
      }),
    ).toBeNull();
  });
});
