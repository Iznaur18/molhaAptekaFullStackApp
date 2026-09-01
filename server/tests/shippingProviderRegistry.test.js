import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_LOBO,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";

import {
  getShippingProvider,
  invokeShippingProvider,
  listShippingProviders,
} from "../services/shipping/index.js";

describe("shippingProviderRegistry", () => {
  it("реестр совпадает с контрактом, первая — ЛОБО", () => {
    const list = listShippingProviders();
    assert.equal(list.length, SHIPPING_PROVIDERS.length);
    assert.equal(list[0].id, SHIPPING_PROVIDER_LOBO);
  });

  it("ЛОБО без ключей живой не считается", () => {
    // Ключей в тестовом окружении нет — служба существует, но не работает.
    assert.equal(getShippingProvider(SHIPPING_PROVIDER_LOBO).isLive(), false);
  });

  it("ЛОБО без ключей отвечает «не настроена», а не 501", async () => {
    await assert.rejects(
      () => invokeShippingProvider(SHIPPING_PROVIDER_LOBO, "quote", {}),
      (error) => error?.statusCode === 503 && /не настроена/i.test(error.message),
    );
  });

  it("returns known provider and rejects unknown", () => {
    assert.equal(getShippingProvider(SHIPPING_PROVIDER_CDEK).label, "СДЭК");
    assert.equal(getShippingProvider(SHIPPING_PROVIDER_LOBO).label, "ЛОБО");
    assert.throws(() => getShippingProvider("dpd"), /Неизвестный провайдер/);
  });

  it("stub methods respond with 501 AppError", async () => {
    await assert.rejects(
      () => invokeShippingProvider(SHIPPING_PROVIDER_CDEK, "quote", {}),
      (error) => error?.statusCode === 501,
    );
    await assert.rejects(
      () => invokeShippingProvider(SHIPPING_PROVIDER_CDEK, "createShipment", {}),
      (error) => error?.statusCode === 501,
    );
  });
});
