import { describe, expect, it } from "vitest";

import { doProductsSupportAnyDelivery } from "@molha/api-contract";
import { prepareCreateProductSubmit } from "./prepareCreateProductSubmit.js";

const courierOnlyForm = {
  productName: "Тестовый курьерский товар",
  productDescription:
    "Описание достаточной длины, чтобы пройти проверку минимальной длины описания товара в схеме.",
  productImageUrls: ["/uploads/a.webp"],
  productImageRows: [{ url: "/uploads/a.webp" }],
  productPrice: "1000",
  productOldPrice: "",
  productListingOrigin: "own",
  productReturnEnabled: false,
  returnTermRows: [],
  productIsAvailable: true,
  productStockQuantity: "5",
  productCharacteristicRows: [],
  productCategoryId: "aaaaaaaaaaaaaaaaaaaaaaaa",
  productPickupLocations: [
    {
      id: "loc-1",
      address: "г Москва, ул Зеленоградская, д 23А",
      lat: 55.7,
      lon: 37.6,
      isDefault: true,
    },
  ],
  productPickupEnabled: false,
  productDeliveryEnabled: false,
  productCourierDeliveryEnabled: true,
};

describe("товар «только курьеры Gitorg»", () => {
  // Товар без самовывоза упирался в «Выберите хотя бы один способ» на форме
  // и в недоступную «Доставку» на чекауте: способов везде считали два.
  it("проходит клиентскую подготовку к отправке", () => {
    const prepared = prepareCreateProductSubmit({
      form: courierOnlyForm,
      isEdit: false,
      showCatalogAvailabilityToggle: true,
    });
    expect(prepared.message ?? null).toBe(null);
    expect(prepared.ok).toBe(true);
  });

  it("считается доставляемым в корзине", () => {
    expect(
      doProductsSupportAnyDelivery([
        { productDeliveryEnabled: false, productCourierDeliveryEnabled: true },
      ]),
    ).toBe(true);
  });

  it("товар без единого способа доставляемым не считается", () => {
    expect(
      doProductsSupportAnyDelivery([
        { productDeliveryEnabled: false, productCourierDeliveryEnabled: false },
      ]),
    ).toBe(false);
  });
});
