import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("../../../shared/api/index.js", () => ({
  apiClient: {
    post: (...args) => postMock(...args),
  },
}));

const { createProduct } = await import("./createProduct.js");

const BASE_BODY = {
  productName: "Тестовый товар",
  productDescription: "Описание товара достаточной длины",
  productPrice: 1000,
  productIsAvailable: true,
  productStockQuantity: 3,
  productListingOrigin: "own",
  productImageUrls: ["/uploads/a.webp"],
  productReturnEnabled: false,
  productReturnTerms: [],
};

const PICKUP_BODY = {
  ...BASE_BODY,
  productRegionCode: "RU-CE",
  productPickupLocations: [
    {
      id: "loc-1",
      label: "",
      address: "г Грозный, ул Мира, 1",
      lat: 43.31,
      lon: 45.69,
      isDefault: true,
    },
  ],
  productPickupEnabled: true,
};

/** @returns {Record<string, unknown>} тело, которое реально ушло на сервер */
const sentPayload = () => postMock.mock.calls[0][1];

describe("createProduct: тело запроса", () => {
  beforeEach(() => {
    postMock.mockReset();
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          message: "ok",
          product: {
            _id: "507f1f77bcf86cd799439011",
            productName: "Тестовый товар",
            productModerationStatus: "pending",
          },
        },
      },
    });
  });

  it("товар по профилю не шлёт ни адрес, ни флаги доставки", async () => {
    await createProduct({ ...PICKUP_BODY, productFulfillmentSource: "profile" });

    const payload = sentPayload();
    expect(payload.productFulfillmentSource).toBe("profile");
    // Схема отклоняет источник «профиль» рядом с собственным адресом: раньше
    // белый список payload дописывал флаги сам, и создание падало с
    // «Укажите адрес продажи».
    for (const key of [
      "productPickupLocations",
      "productPickupAddress",
      "productPickupLat",
      "productPickupLon",
      "productPickupEnabled",
      "productDeliveryEnabled",
      "productCourierDeliveryEnabled",
      "productDeliveryCarrier",
      "productRegionCode",
    ]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("товар по профилю всё равно шлёт условия возврата", async () => {
    await createProduct({
      ...PICKUP_BODY,
      productFulfillmentSource: "profile",
      productReturnEnabled: true,
      productReturnTerms: [{ key: "Срок", value: "14 дней" }],
    });

    const payload = sentPayload();
    expect(payload.productReturnEnabled).toBe(true);
    expect(payload.productReturnTerms).toHaveLength(1);
  });

  it("товар со своими настройками шлёт адрес и перевозчика", async () => {
    await createProduct({
      ...PICKUP_BODY,
      productFulfillmentSource: "custom",
      productDeliveryCarrier: "gitorg_courier",
      productCourierDeliveryEnabled: true,
    });

    const payload = sentPayload();
    expect(payload.productFulfillmentSource).toBe("custom");
    expect(payload.productPickupLocations).toHaveLength(1);
    expect(payload.productRegionCode).toBe("RU-CE");
    // Перевозчик — источник правды на сервере; без него выбор «Курьеры Gitorg»
    // терялся, и товар создавался без доставки.
    expect(payload.productDeliveryCarrier).toBe("gitorg_courier");
    expect(payload.productCourierDeliveryEnabled).toBe(true);
  });

  it("ЛОБО доезжает до сервера, хотя оба старых флага сняты", async () => {
    await createProduct({
      ...PICKUP_BODY,
      productFulfillmentSource: "custom",
      productDeliveryCarrier: "lobo",
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: false,
    });

    const payload = sentPayload();
    expect(payload.productDeliveryCarrier).toBe("lobo");
    expect(payload.productDeliveryEnabled).toBe(false);
    expect(payload.productCourierDeliveryEnabled).toBe(false);
  });
});
