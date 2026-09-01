import { describe, expect, it } from "vitest";
import { SHIPPING_PROVIDER_CDEK } from "@molha/api-contract";

import {
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  hasCheckoutLiveCarrierProviders,
  listCheckoutShippingProviderOptions,
  listCheckoutShippingServiceOptions,
  resolveCheckoutShippingProviderLabel,
} from "./checkoutShippingProviderOptions.js";

describe("checkoutShippingProviderOptions", () => {
  it("перечисляет все службы, неподключённые — как неживые", () => {
    const options = listCheckoutShippingProviderOptions();

    // Продавец живой всегда, перевозчики видны, но помечены неживыми: их
    // показывают со «скоро», а не прячут.
    expect(options[0]).toEqual({ id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true });
    expect(options.length).toBeGreaterThan(1);
    expect(options.slice(1).every((option) => option.live === false)).toBe(true);

    expect(hasCheckoutLiveCarrierProviders()).toBe(false);
    expect(listCheckoutShippingServiceOptions()).toEqual([]);
  });

  it("resolves seller and carrier labels", () => {
    expect(
      resolveCheckoutShippingProviderLabel(CHECKOUT_SHIPPING_PROVIDER_SELLER, {
        sellerLabel: "Продавцом",
      }),
    ).toBe("Продавцом");
    expect(
      resolveCheckoutShippingProviderLabel(SHIPPING_PROVIDER_CDEK, {
        sellerLabel: "Продавцом",
      }),
    ).toBe("СДЭК");
  });
});
