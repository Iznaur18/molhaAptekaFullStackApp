import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const {
  PRODUCT_DELIVERY_CARRIER_LOBO,
  isDeliveryCarrierAvailableInRegion,
  listDeliveryCarriersForRegion,
  resolveProductDeliveryCarrier,
  buildLegacyDeliveryFlags,
  productShipsToBuyer,
} = await import("@molha/api-contract");
const { isLoboConfigured } = await import(
  "../services/shipping/lobo/loboClient.js"
);

describe("ЛОБО на товаре: доступность", () => {
  it("вне Чечни служба недоступна", () => {
    assert.equal(
      isDeliveryCarrierAvailableInRegion(PRODUCT_DELIVERY_CARRIER_LOBO, "RU-MOW"),
      false,
    );
    assert.equal(
      listDeliveryCarriersForRegion("RU-MOW").includes(PRODUCT_DELIVERY_CARRIER_LOBO),
      false,
    );
  });

  it("в Чечне служба в списке", () => {
    assert.equal(
      listDeliveryCarriersForRegion("RU-CE").includes(PRODUCT_DELIVERY_CARRIER_LOBO),
      true,
    );
  });

  it("регион неизвестен — локальную службу не предлагаем", () => {
    assert.equal(
      isDeliveryCarrierAvailableInRegion(PRODUCT_DELIVERY_CARRIER_LOBO, ""),
      false,
      "лучше не показать доступное, чем пообещать несуществующее",
    );
  });

  it("без ключей служба не настроена", () => {
    // В тестовом окружении ключей нет — это и проверяем.
    assert.equal(isLoboConfigured(), false);
  });

  it("у товара с ЛОБО оба старых флага сняты", () => {
    const flags = buildLegacyDeliveryFlags(PRODUCT_DELIVERY_CARRIER_LOBO);
    assert.deepEqual(flags, {
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: false,
    });
    // При этом товар всё равно считается едущим к покупателю.
    assert.equal(
      productShipsToBuyer({ productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_LOBO }),
      true,
      "иначе раздел доставки исчезает с экрана",
    );
  });

  it("старые товары опознаются по прежним флагам", () => {
    assert.equal(
      resolveProductDeliveryCarrier({ productCourierDeliveryEnabled: true }),
      "gitorg_courier",
    );
    assert.equal(
      resolveProductDeliveryCarrier({ productDeliveryEnabled: true }),
      "seller",
    );
    assert.equal(resolveProductDeliveryCarrier({}), null);
  });
});
