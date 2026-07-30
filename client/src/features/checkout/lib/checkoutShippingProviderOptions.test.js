import { describe, expect, it } from "vitest";
import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_RUSSIAN_POST,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
} from "@molha/api-contract";

import {
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  listCheckoutShippingProviderOptions,
  resolveCheckoutShippingProviderLabel,
} from "./checkoutShippingProviderOptions.js";

describe("checkoutShippingProviderOptions", () => {
  it("lists seller first as live and carriers as locked", () => {
    const options = listCheckoutShippingProviderOptions();
    expect(options[0]).toEqual({
      id: CHECKOUT_SHIPPING_PROVIDER_SELLER,
      live: true,
    });
    expect(options.slice(1).map((o) => o.id)).toEqual([
      SHIPPING_PROVIDER_CDEK,
      SHIPPING_PROVIDER_YANDEX_DELIVERY,
      SHIPPING_PROVIDER_RUSSIAN_POST,
    ]);
    expect(options.slice(1).every((o) => o.live === false)).toBe(true);
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
