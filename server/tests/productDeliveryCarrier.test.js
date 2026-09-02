import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  buildLegacyDeliveryFlags,
  createProductBodySchema,
  isDeliveryCarrierAvailableInRegion,
  listDeliveryCarriersForRegion,
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
} = await import("@molha/api-contract");

const BASE_PRODUCT = {
  productName: "Тестовый товар для проверки перевозчика",
  productDescription:
    "Описание достаточной длины, чтобы пройти проверку минимальной длины описания товара.",
  productImageUrls: ["/uploads/a.webp"],
  productPrice: 1000,
  productListingOrigin: "own",
  productReturnEnabled: false,
  productPickupLocations: [
    {
      id: "loc-1",
      address: "г Грозный, ул Мира, 1",
      lat: 43.31,
      lon: 45.69,
      isDefault: true,
    },
  ],
};

describe("перевозчик товара", () => {
  it("старый товар опознаётся по прежним флагам", () => {
    assert.equal(
      resolveProductDeliveryCarrier({ productCourierDeliveryEnabled: true }),
      PRODUCT_DELIVERY_CARRIER_GITORG,
    );
    assert.equal(
      resolveProductDeliveryCarrier({ productDeliveryEnabled: true }),
      PRODUCT_DELIVERY_CARRIER_SELLER,
    );
    assert.equal(resolveProductDeliveryCarrier({}), null, "только самовывоз");
  });

  it("явное поле важнее флагов", () => {
    assert.equal(
      resolveProductDeliveryCarrier({
        productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_LOBO,
        productDeliveryEnabled: true,
      }),
      PRODUCT_DELIVERY_CARRIER_LOBO,
    );
  });

  it("товар с ЛОБО едет к покупателю, хотя старые флаги пусты", () => {
    const product = { productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_LOBO };

    assert.equal(productShipsToBuyer(product), true);
    assert.deepEqual(buildLegacyDeliveryFlags(PRODUCT_DELIVERY_CARRIER_LOBO), {
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: false,
    });
  });

  it("ЛОБО доступна продавцу только из Чечни", () => {
    assert.equal(
      isDeliveryCarrierAvailableInRegion(PRODUCT_DELIVERY_CARRIER_LOBO, "RU-CE"),
      true,
    );
    assert.equal(
      isDeliveryCarrierAvailableInRegion(PRODUCT_DELIVERY_CARRIER_LOBO, "RU-MOW"),
      false,
    );
    assert.deepEqual(listDeliveryCarriersForRegion("RU-MOW"), [
      PRODUCT_DELIVERY_CARRIER_SELLER,
      PRODUCT_DELIVERY_CARRIER_GITORG,
    ]);
    assert.deepEqual(listDeliveryCarriersForRegion("RU-CE"), [
      PRODUCT_DELIVERY_CARRIER_SELLER,
      PRODUCT_DELIVERY_CARRIER_GITORG,
      PRODUCT_DELIVERY_CARRIER_LOBO,
    ]);
  });

  it("схема принимает товар, который возит только ЛОБО", () => {
    const parsed = createProductBodySchema.safeParse({
      ...BASE_PRODUCT,
      productPickupEnabled: false,
      productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_LOBO,
    });

    assert.equal(
      parsed.success,
      true,
      "иначе продавец не сможет продавать только с доставкой ЛОБО",
    );
  });

  it("товар без единого способа получения по-прежнему отклоняется", () => {
    const parsed = createProductBodySchema.safeParse({
      ...BASE_PRODUCT,
      productPickupEnabled: false,
    });

    assert.equal(parsed.success, false);
  });
});
