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
  it("lists only seller while carriers are not live", () => {
    const options = listCheckoutShippingProviderOptions();
    expect(options).toEqual([{ id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true }]);
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
