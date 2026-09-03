import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

// Доступность службы читается из базы: без неё проверка просто зависает.
const { connectMongoTestReplSet, disconnectMongoTestReplSet } = await import(
  "./helpers/mongoTestDb.js"
);
const { buildProductPatchSet } = await import(
  "../services/product/buildProductPatchSet.js"
);

/** Товар, который возят курьеры Gitorg. */
const courierProduct = {
  productModerationStatus: "approved",
  productName: "Товар",
  productDescription: "Описание",
  productPrice: 100,
  productImageUrls: ["https://example.com/a.jpg"],
  productPickupEnabled: true,
  productDeliveryEnabled: false,
  productCourierDeliveryEnabled: true,
  productDeliveryCarrier: "gitorg_courier",
  productPickupAddress: "г Грозный, ул Мира, 1",
  productPickupLat: 43.31,
  productPickupLon: 45.69,
};

const patch = (body, existing = courierProduct) =>
  buildProductPatchSet({
    existing,
    body,
    isAdmin: false,
    productId: "507f1f77bcf86cd799439011",
  });

describe("служба доставки при редактировании товара", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);

  it("снимается, и товар остаётся на самовывозе", async () => {
    // Поле раньше не применялось вовсе: служба оставалась навсегда, и флажок
    // «Доставка» возвращался включённым при каждом открытии формы.
    const { $set } = await patch({
      productDeliveryCarrier: "",
      productPickupEnabled: true,
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: false,
    });

    assert.equal($set.productDeliveryCarrier, "");
    assert.equal($set.productDeliveryEnabled, false);
    assert.equal($set.productCourierDeliveryEnabled, false);
  });

  it("меняется на доставку продавцом вместе со старыми флагами", async () => {
    const { $set } = await patch({ productDeliveryCarrier: "seller" });

    assert.equal($set.productDeliveryCarrier, "seller");
    assert.equal($set.productDeliveryEnabled, true);
    assert.equal($set.productCourierDeliveryEnabled, false);
  });

  it("нельзя убрать разом и доставку, и самовывоз", async () => {
    await assert.rejects(
      () =>
        patch({
          productDeliveryCarrier: "",
          productPickupEnabled: false,
        }),
      /способ/iu,
    );
  });

  it("без поля службы прежний выбор не трогается", async () => {
    const { $set } = await patch({ productName: "Другое название" });

    assert.equal($set.productDeliveryCarrier, undefined);
  });
});
