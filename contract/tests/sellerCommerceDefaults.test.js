import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ORDER_PAYMENT_METHODS,
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  createProductBodySchema,
  isPaymentMethodAcceptedBySeller,
  patchMyProductBodySchema,
  productMatchesSellerFulfillmentDefaults,
  resolveSellerFulfillmentDefaults,
  resolveSellerPaymentMethods,
  sellerCommerceDefaultsBodySchema,
} from "../src/index.js";

const POINT = {
  address: "Грозный, проспект Путина, 1",
  lat: 43.3,
  lon: 45.7,
  isDefault: true,
};

const CREATE_BASE = {
  productName: "Тестовый товар",
  productDescription: "Описание товара достаточной длины для проверки схемы",
  productPrice: 100,
  productCategory: "electronics",
  productImageUrls: ["/uploads/a.webp"],
  productListingOrigin: "own",
};

describe("sellerCommerceDefaultsBodySchema", () => {
  it("принимает самовывоз без перевозчика", () => {
    const parsed = sellerCommerceDefaultsBodySchema.parse({
      pickupLocations: [POINT],
      pickupEnabled: true,
      deliveryCarrier: "",
      paymentMethods: ["cardOnDelivery"],
    });
    assert.equal(parsed.pickupEnabled, true);
    assert.equal(parsed.deliveryCarrier, "");
  });

  it("отклоняет настройку без единого способа получения", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      pickupLocations: [POINT],
      pickupEnabled: false,
      deliveryCarrier: "",
      paymentMethods: ["cardOnDelivery"],
    });
    assert.equal(parsed.success, false);
  });

  it("отклоняет пустой список оплат", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      pickupLocations: [POINT],
      pickupEnabled: true,
      deliveryCarrier: "",
      paymentMethods: [],
    });
    assert.equal(parsed.success, false);
  });

  it("приводит оплаты к каноническому порядку", () => {
    const parsed = sellerCommerceDefaultsBodySchema.parse({
      pickupLocations: [POINT],
      pickupEnabled: true,
      deliveryCarrier: "",
      paymentMethods: ["cardOnDelivery", "cashOnDelivery"],
    });
    assert.deepEqual(parsed.paymentMethods, ["cashOnDelivery", "cardOnDelivery"]);
  });

  it("отклоняет две одинаковые точки", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      pickupLocations: [POINT, { ...POINT, isDefault: false }],
      pickupEnabled: true,
      deliveryCarrier: "",
      paymentMethods: ["cashOnDelivery"],
    });
    assert.equal(parsed.success, false);
  });
});

describe("resolveSellerPaymentMethods", () => {
  it("продавец без настройки принимает всё", () => {
    assert.deepEqual(resolveSellerPaymentMethods({}), [...ORDER_PAYMENT_METHODS]);
    assert.deepEqual(resolveSellerPaymentMethods(null), [...ORDER_PAYMENT_METHODS]);
  });

  it("пустой массив читается как «не настраивал», а не «ничего не принимает»", () => {
    assert.deepEqual(resolveSellerPaymentMethods({ sellerPaymentMethods: [] }), [
      ...ORDER_PAYMENT_METHODS,
    ]);
  });

  it("незнакомые значения отбрасываются", () => {
    assert.deepEqual(
      resolveSellerPaymentMethods({
        sellerPaymentMethods: ["cardOnDelivery", "bitcoin"],
      }),
      ["cardOnDelivery"],
    );
  });

  it("isPaymentMethodAcceptedBySeller следует списку", () => {
    const seller = { sellerPaymentMethods: ["cardOnDelivery"] };
    assert.equal(isPaymentMethodAcceptedBySeller(seller, "cardOnDelivery"), true);
    assert.equal(isPaymentMethodAcceptedBySeller(seller, "cashOnDelivery"), false);
  });
});

describe("resolveSellerFulfillmentDefaults", () => {
  it("возвращает null, пока продавец ничего не настроил", () => {
    assert.equal(resolveSellerFulfillmentDefaults({}), null);
    assert.equal(
      resolveSellerFulfillmentDefaults({ sellerFulfillmentDefaults: {} }),
      null,
    );
  });

  it("нормализует точки и перевозчика", () => {
    const resolved = resolveSellerFulfillmentDefaults({
      sellerFulfillmentDefaults: {
        pickupEnabled: true,
        deliveryCarrier: PRODUCT_DELIVERY_CARRIER_GITORG,
        pickupLocations: [{ id: "p1", ...POINT }],
        regionCode: "RU-CE",
      },
    });
    assert.equal(resolved.pickupEnabled, true);
    assert.equal(resolved.deliveryCarrier, PRODUCT_DELIVERY_CARRIER_GITORG);
    assert.equal(resolved.pickupLocations.length, 1);
    assert.equal(resolved.pickupLocations[0].isDefault, true);
    assert.equal(resolved.regionCode, "RU-CE");
  });

  it("настройка без способа получения нежизнеспособна", () => {
    assert.equal(
      resolveSellerFulfillmentDefaults({
        sellerFulfillmentDefaults: {
          pickupEnabled: false,
          deliveryCarrier: "",
          pickupLocations: [{ id: "p1", ...POINT }],
        },
      }),
      null,
    );
  });
});

describe("productMatchesSellerFulfillmentDefaults", () => {
  const defaults = resolveSellerFulfillmentDefaults({
    sellerFulfillmentDefaults: {
      pickupEnabled: true,
      deliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
      pickupLocations: [{ id: "p1", ...POINT }],
    },
  });

  it("совпадает с товаром на тех же настройках", () => {
    assert.equal(
      productMatchesSellerFulfillmentDefaults(
        {
          productPickupEnabled: true,
          productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
          productPickupAddress: POINT.address,
          productPickupLat: POINT.lat,
          productPickupLon: POINT.lon,
        },
        defaults,
      ),
      true,
    );
  });

  it("опознаёт старый товар по легаси-флагам", () => {
    assert.equal(
      productMatchesSellerFulfillmentDefaults(
        {
          productPickupEnabled: true,
          productDeliveryEnabled: true,
          productPickupAddress: POINT.address,
          productPickupLat: POINT.lat,
          productPickupLon: POINT.lon,
        },
        defaults,
      ),
      true,
    );
  });

  it("разный адрес — не совпадает", () => {
    assert.equal(
      productMatchesSellerFulfillmentDefaults(
        {
          productPickupEnabled: true,
          productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
          productPickupAddress: "Грозный, улица Мира, 5",
          productPickupLat: 43.31,
          productPickupLon: 45.71,
        },
        defaults,
      ),
      false,
    );
  });

  it("разный перевозчик — не совпадает", () => {
    assert.equal(
      productMatchesSellerFulfillmentDefaults(
        {
          productPickupEnabled: true,
          productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_GITORG,
          productPickupAddress: POINT.address,
          productPickupLat: POINT.lat,
          productPickupLon: POINT.lon,
        },
        defaults,
      ),
      false,
    );
  });
});

describe("productFulfillmentSource в схемах товара", () => {
  it("создание по профилю не требует адреса", () => {
    const parsed = createProductBodySchema.safeParse({
      ...CREATE_BASE,
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });
    assert.equal(parsed.success, true);
  });

  it("создание без профиля по-прежнему требует адрес", () => {
    const parsed = createProductBodySchema.safeParse({
      ...CREATE_BASE,
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
    });
    assert.equal(parsed.success, false);
  });

  it("профиль вместе со своим адресом — конфликт, а не молчаливая потеря", () => {
    const parsed = createProductBodySchema.safeParse({
      ...CREATE_BASE,
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
      productPickupAddress: POINT.address,
      productPickupLat: POINT.lat,
      productPickupLon: POINT.lon,
    });
    assert.equal(parsed.success, false);
  });

  it("патч на профиль вместе с адресом — тоже конфликт", () => {
    const parsed = patchMyProductBodySchema.safeParse({
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
      productPickupAddress: POINT.address,
    });
    assert.equal(parsed.success, false);
  });

  it("патч только на профиль проходит", () => {
    const parsed = patchMyProductBodySchema.safeParse({
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });
    assert.equal(parsed.success, true);
  });
});
