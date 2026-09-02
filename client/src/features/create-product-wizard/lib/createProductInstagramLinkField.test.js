import { describe, expect, it } from "vitest";

import { parseInstagramPostUrl } from "@molha/api-contract";

import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { createImageRow } from "../../../entities/product/lib/productImageRowHelpers.js";
import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";

const baseForm = {
  ...CREATE_PRODUCT_INITIAL_FORM,
  productName: "Тестовый товар",
  productListingOrigin: "own",
  productDescription: "Описание товара достаточно длинное для валидации",
  productImageRows: [createImageRow("/uploads/a.jpg")],
  productPrice: "1000",
  productCategory: "electronics",
  productCategoryId: "507f1f77bcf86cd799439011",
  productRegionCode: "RU-MOW",
  productReturnEnabled: false,
  productPickupLocations: [
    {
      id: "loc-1",
      label: "",
      address: "Москва, Тверская улица, 1",
      lat: 55.75,
      lon: 37.62,
      isDefault: true,
      selectedFromSuggest: true,
    },
  ],
};

describe("create product Instagram link field", () => {
  it("keeps productInstagramPostUrl on initial form", () => {
    expect(CREATE_PRODUCT_INITIAL_FORM).toHaveProperty("productInstagramPostUrl", "");
  });

  it("includes normalized instagram url in create body", () => {
    const result = prepareCreateProductSubmit({
      form: {
        ...baseForm,
        productInstagramPostUrl: "https://www.instagram.com/p/ABC123_xYz/",
      },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.createBody?.productInstagramPostUrl).toBe(
      parseInstagramPostUrl("https://www.instagram.com/p/ABC123_xYz/")?.postUrl,
    );
  });
});
