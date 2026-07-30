import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";

import {
  getShippingProvider,
  invokeShippingProvider,
  listShippingProviders,
} from "../services/shipping/index.js";

describe("shippingProviderRegistry", () => {
  it("lists stub providers matching contract", () => {
    const list = listShippingProviders();
    assert.equal(list.length, SHIPPING_PROVIDERS.length);
    assert.equal(list[0].id, SHIPPING_PROVIDER_CDEK);
    assert.equal(list[0].isLive(), false);
  });

  it("returns known provider and rejects unknown", () => {
    assert.equal(getShippingProvider(SHIPPING_PROVIDER_CDEK).label, "СДЭК");
    assert.throws(() => getShippingProvider("dpd"), /Неизвестный провайдер/);
  });

  it("stub methods respond with 501 AppError", async () => {
    await assert.rejects(
      () => invokeShippingProvider(SHIPPING_PROVIDER_CDEK, "quote", {}),
      (error) => error?.statusCode === 501,
    );
    await assert.rejects(
      () =>
        invokeShippingProvider(SHIPPING_PROVIDER_CDEK, "createShipment", {}),
      (error) => error?.statusCode === 501,
    );
  });
});
