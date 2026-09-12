import { describe, expect, it } from "vitest";

import { quoteCartSellerDelivery } from "./quoteCartSellerDelivery.js";

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 55, freeFromRub: 0 };

describe("quoteCartSellerDelivery", () => {
  it("без расстояния — оценка и товары + fee", () => {
    const quote = quoteCartSellerDelivery({
      tariff: TARIFF,
      distanceKm: null,
      goodsTotalRub: 120_000,
    });

    expect(quote?.isEstimate).toBe(true);
    expect(quote?.payableRub).toBe(120_000 + quote.feeRub);
  });

  it("с расстоянием от сервера — точная сумма", () => {
    const quote = quoteCartSellerDelivery({
      tariff: TARIFF,
      distanceKm: 12.2,
      goodsTotalRub: 1000,
    });

    // 12,2 км по дорогам → 13 полных: 200 + 13 * 55
    expect(quote?.feeRub).toBe(915);
    expect(quote?.isEstimate).toBe(false);
    expect(quote?.payableRub).toBe(1915);
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
