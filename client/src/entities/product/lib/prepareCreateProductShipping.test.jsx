import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "./createProductFormState.js";
import { prepareCreateProductSubmit } from "./prepareCreateProductSubmit.js";

/**
 * Форма товара, заполненная по минимуму: проверяем только вес и габариты.
 *
 * @param {Record<string, unknown>} overrides
 */
function formWith(overrides) {
  return {
    ...CREATE_PRODUCT_INITIAL_FORM,
    productName: "Тестовый товар",
    productDescription: "Описание товара для проверки веса и габаритов",
    productPrice: "1000",
    productListingOrigin: "own",
    productImageRows: [{ id: "row-1", url: "https://gitorg.ru/uploads/a.webp" }],
    // Товар следует настройкам профиля: адреса самовывоза в форме нет.
    productFulfillmentSource: "profile",
    productReturnEnabled: false,
    ...overrides,
  };
}

const submitArgs = {
  isEdit: false,
  showCatalogAvailabilityToggle: true,
};

describe("вес и габариты в отправке товара", () => {
  it("заполненные поля уходят числами", () => {
    const result = prepareCreateProductSubmit({
      form: formWith({
        productWeightG: "2500",
        productLengthCm: "40",
        productWidthCm: "30",
        productHeightCm: "20",
      }),
      ...submitArgs,
    });

    expect(result.ok).toBe(true);
    expect(result.createBody.productWeightG).toBe(2500);
    expect(result.createBody.productLengthCm).toBe(40);
    expect(result.createBody.productWidthCm).toBe(30);
    expect(result.createBody.productHeightCm).toBe(20);
  });

  it("пустые поля уходят как null: продавец не обязан их знать", () => {
    const result = prepareCreateProductSubmit({ form: formWith({}), ...submitArgs });

    expect(result.ok).toBe(true);
    expect(result.createBody.productWeightG).toBeNull();
    expect(result.createBody.productHeightCm).toBeNull();
  });

  it("мусор и ноль не превращаются в габариты", () => {
    const result = prepareCreateProductSubmit({
      form: formWith({ productWeightG: "0", productLengthCm: "abc" }),
      ...submitArgs,
    });

    expect(result.ok).toBe(true);
    expect(result.createBody.productWeightG).toBeNull();
    expect(result.createBody.productLengthCm).toBeNull();
  });
});
