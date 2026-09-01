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
  it("вне Чечни ЛОБО не предлагается", () => {
    const moscow = listCheckoutShippingProviderOptions({ regionCode: "RU-MOW" });
    expect(moscow.some((option) => option.id === "lobo")).toBe(false);
    expect(moscow[0]).toEqual({ id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true });
  });

  it("в Чечне ЛОБО есть и она живая", () => {
    const grozny = listCheckoutShippingProviderOptions({ regionCode: "RU-CE" });
    const lobo = grozny.find((option) => option.id === "lobo");
    expect(lobo).toEqual({ id: "lobo", live: true });
  });

  it("неподключённые перевозчики видны, но неживые", () => {
    const grozny = listCheckoutShippingProviderOptions({ regionCode: "RU-CE" });
    const cdek = grozny.find((option) => option.id === "cdek");
    expect(cdek).toEqual({ id: "cdek", live: false });
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
